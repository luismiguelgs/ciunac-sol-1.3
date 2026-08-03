import { afterEach, describe, expect, it, vi } from 'vitest'
import { verifyCaptchaToken } from '@/modules/security/server/captcha'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { getCaptchaSecret, getOtpSessionSecret } from '@/modules/security/server/environment'
import { SecurityError } from '@/modules/security/server/security-error'
import { decryptToken, encryptToken } from '@/modules/security/server/token-crypto'

const originalEnvironment = { ...process.env }

afterEach(() => {
  process.env = { ...originalEnvironment }
  vi.restoreAllMocks()
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
    const tampered = parts.join('.')

    expect(decryptToken(tampered, secret)).toBeNull()
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
