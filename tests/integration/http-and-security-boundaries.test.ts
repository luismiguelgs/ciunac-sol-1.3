import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetchResult } from '@/lib/api.service'
import { verifyCaptchaToken } from '@/modules/security/server/captcha'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { getCaptchaSecret, getOtpSessionSecret } from '@/modules/security/server/environment'
import { SecurityError } from '@/modules/security/server/security-error'
import { decryptToken, encryptToken } from '@/modules/security/server/token-crypto'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'

const originalEnvironment = { ...process.env }

afterEach(() => {
  process.env = { ...originalEnvironment }
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('server-side security boundaries', () => {
  it('rejects an invalid CAPTCHA response', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'test-recaptcha-secret'
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(
      JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ))

    await expect(verifyCaptchaToken('invalid-captcha-token', undefined, fetcher))
      .rejects.toMatchObject({ code: 'CAPTCHA_FAILED', status: 400 })
  })

  it('rejects a tampered encrypted cookie', () => {
    const secret = 'test-secret-with-at-least-thirty-two-bytes'
    const token = encryptToken({ purpose: 'CERTIFICADO' }, secret)
    const parts = token.split('.')
    parts[2] = `${parts[2].startsWith('A') ? 'B' : 'A'}${parts[2].slice(1)}`

    expect(decryptToken(parts.join('.'), secret)).toBeNull()
  })

  it('normalizes an email provider failure', async () => {
    process.env.API_URL = 'https://ciunac.test'
    process.env.API_KEY = 'private-test-key'
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response(
      JSON.stringify({ internal: 'provider detail must not escape' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )))

    await expect(ciunacRequest('mailer', {
      method: 'POST',
      body: { type: 'RANDOM', email: 'security@example.com', number: 123456 },
    })).rejects.toMatchObject({ code: 'UPSTREAM_ERROR', status: 503 })
  })

  it('fails closed when private CAPTCHA configuration is absent', () => {
    delete process.env.RECAPTCHA_SECRET_KEY
    expect(() => getCaptchaSecret())
      .toThrowError(expect.objectContaining<Partial<SecurityError>>({ code: 'SERVICE_UNAVAILABLE' }))
  })

  it('rejects an OTP session secret shorter than 32 bytes', () => {
    process.env.OTP_SESSION_SECRET = 'too-short'
    expect(() => getOtpSessionSecret())
      .toThrowError(expect.objectContaining<Partial<SecurityError>>({ code: 'SERVICE_UNAVAILABLE' }))
  })
})

describe('HTTP result boundary', () => {
  it('returns data for a valid JSON response', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ id: '1' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })))

    await expect(apiFetchResult<{ id: string }>('resource', 'GET')).resolves.toEqual({
      ok: true,
      kind: 'data',
      data: { id: '1' },
    })
  })

  it('returns an explicit empty result for a 204 response', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 })))
    await expect(apiFetchResult('resource', 'PATCH')).resolves.toEqual({ ok: true, kind: 'empty' })
  })

  it('rejects malformed JSON as an external service error', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response('{invalid', { status: 200 })))
    await expect(apiFetchResult('resource', 'GET')).resolves.toMatchObject({
      ok: false,
      kind: 'error',
      error: { code: 'EXTERNAL_SERVICE' },
    })
  })

  it('normalizes a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockRejectedValue(new TypeError('private network detail')))
    await expect(apiFetchResult('resource', 'GET')).resolves.toMatchObject({
      ok: false,
      kind: 'error',
      error: { code: 'NETWORK', retryable: true },
    })
  })

  it('maps authentication and provider errors without exposing provider bodies', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ internal: 'hidden' }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ internal: 'hidden' }), { status: 503 })))

    const unauthorized = await apiFetchResult('resource', 'GET')
    const unavailable = await apiFetchResult('resource', 'GET')
    expect(unauthorized).toMatchObject({ ok: false, error: { code: 'AUTHENTICATION' } })
    expect(unavailable).toMatchObject({ ok: false, error: { code: 'EXTERNAL_SERVICE' } })
    if (!unavailable.ok) expect(unavailable.error.message).not.toContain('hidden')
  })

  it('normalizes unexpected errors without exposing their internal message', () => {
    const result = normalizeAppError(new Error('private implementation detail'), 'No se pudo completar la operacion')
    expect(result).toMatchObject({ code: 'UNEXPECTED', message: 'No se pudo completar la operacion' })
    expect(result.message).not.toContain('private implementation detail')
  })
})
