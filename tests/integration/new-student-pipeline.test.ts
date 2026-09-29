import { afterEach, describe, expect, it, vi } from 'vitest'
import { registerNewStudent, retryNewStudentNotification } from '@/modules/solicitud-nuevo/client'
import type { NewStudent } from '@/modules/solicitud-nuevo/model'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('new student public registration pipeline', () => {
  it.each(['204', 'empty-body', 'empty-object', 'object'])('preserves Q10 success with %s and the exact DTO', async (response) => {
    const calls: Array<{ url: string; body: unknown }> = []
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      const url = String(input)
      expect(init?.method).toBe('POST')
      expect(new Headers(init?.headers).has('x-api-key')).toBe(false)
      expect(new Headers(init?.headers).has('Api-Key')).toBe(false)
      calls.push({ url, body: JSON.parse(String(init?.body)) })
      if (url.endsWith('/q10/estudiantes')) {
        if (response === '204') return new Response(null, { status: 204 })
        if (response === 'empty-body') return new Response(null, { status: 200 })
        return json(response === 'empty-object' ? {} : { codigo: 'student-1' })
      }
      return json({ ok: true, receiptId: 'receipt-1' }, 202)
    }))
    await expect(registerNewStudent({ student: student() })).resolves.toEqual({
      status: 'completed', documentNumber: '12345678', notificationReceiptId: 'receipt-1',
    })
    expect(calls).toEqual([
      { url: '/api/ciunac/q10/estudiantes', body: {
        Primer_apellido: 'PEREZ', Segundo_apellido: 'LOPEZ', Primer_nombre: 'MARIA',
        Email: 'user@example.com', Codigo_tipo_identificacion: 'PE01', Numero_identificacion: '12345678',
        Genero: 'F', Fecha_nacimiento: '2000-01-01T00:00:00.000Z', Telefono: '999888777',
        Celular: '999888777', Codigo_programa: 'ING',
      } },
      { url: '/api/security/notifications', body: { type: 'REGISTER', reference: '12345678' } },
    ])
  })

  it.each(['null', '[]', '"ok"', '1', '{invalid'])('does not send mail after the Q10 response %s', async (body) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(body, {
      status: 200, headers: { 'Content-Type': 'application/json' },
    }))
    vi.stubGlobal('fetch', fetcher)
    await expect(registerNewStudent({ student: student() })).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(String(fetcher.mock.calls[0][0])).toBe('/api/ciunac/q10/estudiantes')
  })

  it.each([
    [400, 'VALIDATION'], [401, 'AUTHENTICATION'], [403, 'AUTHORIZATION'], [500, 'EXTERNAL_SERVICE'],
  ])('preserves Q10 HTTP %s without sending mail or retrying registration', async (status, code) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(json({
      error: { message: 'No se pudo completar la operacion.' }, correlationId: 'q10-response',
    }, Number(status)))
    vi.stubGlobal('fetch', fetcher)
    await expect(registerNewStudent({ student: student() })).rejects.toMatchObject({
      code, status, correlationId: 'q10-response', retryable: Number(status) >= 500,
    })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('preserves indeterminate network failure and never automatically resends Q10', async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'))
    vi.stubGlobal('fetch', fetcher)
    await expect(registerNewStudent({ student: student() })).rejects.toMatchObject({ code: 'NETWORK', retryable: true })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('retains the student reference and mail error metadata, retrying only notification', async () => {
    const calls: string[] = []
    let notifications = 0
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input)
      calls.push(url)
      if (url.endsWith('/q10/estudiantes')) return new Response(null, { status: 204 })
      notifications += 1
      return notifications === 1
        ? json({ error: { message: 'La operacion no esta permitida.' }, correlationId: 'mail-denied' }, 403)
        : json({ ok: true, receiptId: 'receipt-retry' }, 202)
    }))
    await expect(registerNewStudent({ student: student() })).resolves.toMatchObject({
      status: 'saved_notification_failed', documentNumber: '12345678',
      error: { code: 'AUTHORIZATION', status: 403, retryable: false, correlationId: 'mail-denied' },
    })
    await expect(retryNewStudentNotification('12345678')).resolves.toBe('receipt-retry')
    expect(calls).toEqual([
      '/api/ciunac/q10/estudiantes', '/api/security/notifications', '/api/security/notifications',
    ])
  })

  it('does not claim completion when notification has no receipt', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input) => (
      String(input).endsWith('/q10/estudiantes') ? json({}) : json({ ok: true }, 202)
    )))
    await expect(registerNewStudent({ student: student() })).resolves.toMatchObject({
      status: 'saved_notification_failed', documentNumber: '12345678',
      error: { code: 'UNEXPECTED', message: 'El estudiante se guardo, pero el correo no pudo enviarse.' },
    })
  })

  it('rejects an invalid retry reference before HTTP', () => {
    const fetcher = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetcher)
    expect(() => retryNewStudentNotification('invalid/reference')).toThrow()
    expect(fetcher).not.toHaveBeenCalled()
  })
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function student(): NewStudent {
  return {
    email: 'USER@EXAMPLE.COM', firstLastName: 'Perez', secondLastName: 'Lopez',
    firstName: 'Maria', secondName: null, gender: 'F', birthDate: '2000-01-01', phone: '999888777',
    document: { type: 'DNI', number: '12345678' }, program: { code: 'ING', name: 'INGLES' },
  }
}
