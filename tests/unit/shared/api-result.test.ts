import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetchResult } from '@/lib/api.service'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('apiFetchResult', () => {
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
    const result = await apiFetchResult('resource', 'GET')
    expect(result).toMatchObject({ ok: false, kind: 'error', error: { code: 'EXTERNAL_SERVICE' } })
  })

  it('normalizes a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockRejectedValue(new TypeError('private network detail')))
    const result = await apiFetchResult('resource', 'GET')
    expect(result).toMatchObject({ ok: false, kind: 'error', error: { code: 'NETWORK', retryable: true } })
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
