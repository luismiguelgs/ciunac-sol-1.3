import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiCommand, apiFetch, apiFetchOptional, apiUpload } from '@/lib/api.service'
import { requestOtp } from '@/modules/security/client/security-client'
import { requestJsonResult } from '@/modules/shared/infrastructure/http/browser-http'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

const consumers = [
  ['resource', () => apiFetch('estudiantes', 'POST', { nombres: 'Test' })],
  ['upload', () => apiUpload('upload/vouchers', new FormData())],
  ['security', () => requestOtp('test@example.com', 'CERTIFICADO', 'captcha-test')],
] as const

describe.each(consumers)('shared browser transport: %s', (_name, request) => {
  it.each([
    [400, 'VALIDATION'], [409, 'VALIDATION'], [413, 'VALIDATION'], [415, 'VALIDATION'],
    [422, 'VALIDATION'], [401, 'AUTHENTICATION'], [403, 'AUTHORIZATION'],
    [429, 'UNEXPECTED'], [503, 'EXTERNAL_SERVICE'],
  ])('preserves HTTP %s status and correlation across consumers', async (status, code) => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: { message: 'Mensaje seguro' }, correlationId: 'test-correlation',
    }), { status }))
    vi.stubGlobal('fetch', fetcher)
    await expect(request()).rejects.toMatchObject({
      code, status, message: 'Mensaje seguro', correlationId: 'test-correlation',
      retryable: status >= 500 || status === 429,
    })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('rejects malformed success and never retries a write', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('<private>invalid', { status: 200 }))
    vi.stubGlobal('fetch', fetcher)
    await expect(request()).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE', retryable: false })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('normalizes a network failure without leaking its message', async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError('private network details'))
    vi.stubGlobal('fetch', fetcher)
    await expect(request()).rejects.toMatchObject({ code: 'NETWORK', retryable: true })
    await expect(request()).rejects.not.toThrow('private network details')
  })
})

describe('transport semantics', () => {
  it('covers the response body with the same timeout and performs no automatic retry', async () => {
    vi.useFakeTimers()
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (_path, options) => {
      const response = Response.json({ ok: true })
      vi.spyOn(response, 'text').mockImplementation(() => new Promise((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true })
      }))
      return response
    })
    vi.stubGlobal('fetch', fetcher)
    const pending = requestJsonResult('/api/ciunac/solicitudes', 'POST', {})
    await vi.advanceTimersByTimeAsync(15_001)
    await expect(pending).resolves.toMatchObject({ ok: false, error: { code: 'NETWORK', retryable: true } })
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('normalizes failures while reading the response body', async () => {
    const response = Response.json({ ok: true })
    vi.spyOn(response, 'text').mockRejectedValue(new TypeError('private read error'))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
    await expect(requestJsonResult('/api/security/consulta', 'POST', {})).resolves.toMatchObject({
      ok: false, error: { code: 'NETWORK', retryable: true },
    })
  })

  it('does not send a payload that cannot be serialized', async () => {
    const body: Record<string, unknown> = {}
    body.self = body
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)
    await expect(requestJsonResult('/api/ciunac/solicitudes', 'POST', body)).resolves.toMatchObject({
      ok: false, error: { code: 'UNEXPECTED' },
    })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each(['null', 'false', ''])('rejects an empty security acknowledgement %s', async (body) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { status: 200 })))
    await expect(requestOtp('test@example.com', 'BECA', 'captcha')).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
  })

  it('preserves JSON, multipart, same-origin cookies and no API key in browser requests', async () => {
    const fetcher = vi.fn().mockImplementation(() => Promise.resolve(Response.json({ ok: true })))
    vi.stubGlobal('fetch', fetcher)
    const formData = new FormData()
    formData.set('file', new File(['%PDF-'], 'voucher.pdf', { type: 'application/pdf' }))
    await apiUpload('upload/vouchers', formData)
    await requestOtp('test@example.com', 'BECA', 'captcha-test')
    const [uploadPath, uploadOptions] = fetcher.mock.calls[0]
    const [otpPath, otpOptions] = fetcher.mock.calls[1]
    expect(uploadPath).toBe('/api/ciunac/upload/vouchers')
    expect(uploadOptions.body).toBe(formData)
    expect(new Headers(uploadOptions.headers).has('Content-Type')).toBe(false)
    expect(otpPath).toBe('/api/security/otp/request')
    expect(JSON.parse(otpOptions.body)).toEqual({
      email: 'test@example.com', purpose: 'BECA', captchaToken: 'captcha-test',
    })
    for (const [, options] of fetcher.mock.calls) {
      expect(options.credentials).toBe('same-origin')
      expect(new Headers(options.headers).has('x-api-key')).toBe(false)
    }
  })

  it('keeps required, optional and command responses distinct', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(new Response(null, { status: 204 }))))
    await expect(apiFetch('solicitudes', 'POST', {})).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
    await expect(apiFetchOptional('solicitudes/1', 'GET')).resolves.toBeNull()
    await expect(apiCommand('certificados/1', 'PATCH', {})).resolves.toBeUndefined()
    await expect(requestOtp('test@example.com', 'BECA', 'captcha')).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
  })

  it('does not expose invalid error envelopes or lose HTTP authentication status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('private HTML failure', { status: 401 })))
    await expect(apiFetch('resource', 'GET')).rejects.toMatchObject({ code: 'AUTHENTICATION', status: 401 })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: { message: { private: true } } }, { status: 503 })))
    await expect(apiFetch('resource', 'GET')).rejects.toMatchObject({
      code: 'EXTERNAL_SERVICE', message: 'El servicio no esta disponible temporalmente.',
    })
  })
})
