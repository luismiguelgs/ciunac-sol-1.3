import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  findConstanciaStudent,
  getConstanciaCargo,
  registerSolicitudConstancia,
  retrySolicitudConstanciaNotification,
} from '@/modules/solicitud-constancia/client'
import type { SolicitudConstancia } from '@/modules/solicitud-constancia/model'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('constancia public API and HTTP contracts', () => {
  it.each([5, 6] as const)('registers type %s once with unchanged DTOs and no browser API key', async (typeId) => {
    const calls: Array<{ url: string; method: string | undefined; body: unknown }> = []
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      const url = String(input)
      expect(new Headers(init?.headers).has('x-api-key')).toBe(false)
      calls.push({ url, method: init?.method, body: JSON.parse(String(init?.body)) })
      if (url.endsWith('/estudiantes')) return json({ id: 'student-1' })
      if (url.endsWith('/solicitudes')) return json({ id: 81 })
      return json({ ok: true, receiptId: 'receipt-1' }, 202)
    }))
    await expect(registerSolicitudConstancia({ solicitud: request(typeId) })).resolves.toEqual({
      status: 'completed', requestId: '81', notificationReceiptId: 'receipt-1',
    })
    expect(calls).toEqual([
      { url: '/api/ciunac/estudiantes', method: 'POST', body: {
        nombres: 'MARIA', apellidos: 'PEREZ', tipoDocumento: 'DNI', numeroDocumento: '12345678',
        celular: '999888777', email: 'user@example.com',
      } },
      { url: '/api/ciunac/solicitudes', method: 'POST', body: {
        estudianteId: 'student-1', tipoSolicitudId: typeId, idiomaId: 2, nivelId: 1,
        estadoId: 1, periodo: expect.stringMatching(/^\d{6}$/), alumnoCiunac: false,
        fechaPago: '2026-08-01T00:00:00.000Z', pago: 30, digital: true,
        numeroVoucher: '123456789012345', imgVoucher: '/voucher.png',
      } },
      { url: '/api/security/notifications', method: 'POST', body: { type: 'CONSTANCIA', reference: '81' } },
    ])
  })

  it('updates an existing student and retries only notification', async () => {
    const calls: string[] = []
    let notifications = 0
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      const url = String(input)
      calls.push(`${init?.method} ${url}`)
      if (url.endsWith('/estudiantes/student-1')) return json({ id: 'student-1' })
      if (url.endsWith('/solicitudes')) return json({ id: 81 })
      notifications += 1
      return notifications === 1
        ? json({ error: { message: 'La operacion no esta permitida.' }, correlationId: 'mail-denied' }, 403)
        : json({ ok: true, receiptId: 'receipt-retry' }, 202)
    }))
    const solicitud = request()
    solicitud.basicData.existingStudentId = 'student-1'
    await expect(registerSolicitudConstancia({ solicitud })).resolves.toMatchObject({
      status: 'saved_notification_failed', requestId: '81',
      error: { code: 'AUTHORIZATION', status: 403, retryable: false, correlationId: 'mail-denied' },
    })
    await expect(retrySolicitudConstanciaNotification('81')).resolves.toBe('receipt-retry')
    expect(calls).toEqual([
      'PATCH /api/ciunac/estudiantes/student-1', 'POST /api/ciunac/solicitudes',
      'POST /api/security/notifications', 'POST /api/security/notifications',
    ])
  })

  it.each(['estudiantes', 'solicitudes'].flatMap((resource) =>
    ['empty', 'null', 'incomplete', 'invalid-json'].map((response) => ({ resource, response })),
  ))('stops at $resource on $response without mailing or retrying writes', async ({ resource, response }) => {
    const calls: string[] = []
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input)
      calls.push(url)
      if (!url.endsWith(`/${resource}`)) return json({ id: 'student-1' })
      if (response === 'empty') return new Response(null, { status: 204 })
      if (response === 'invalid-json') return new Response('{invalid', { status: 200 })
      return json(response === 'null' ? null : {})
    }))
    await expect(registerSolicitudConstancia({ solicitud: request() }))
      .rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
    expect(calls).toEqual(resource === 'estudiantes'
      ? ['/api/ciunac/estudiantes'] : ['/api/ciunac/estudiantes', '/api/ciunac/solicitudes'])
  })

  it('does not retry an indeterminate request write after a network error', async () => {
    const calls: string[] = []
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input)
      calls.push(url)
      if (url.endsWith('/estudiantes')) return json({ id: 'student-1' })
      throw new TypeError('Failed to fetch')
    }))
    await expect(registerSolicitudConstancia({ solicitud: request() }))
      .rejects.toMatchObject({ code: 'NETWORK', retryable: true })
    expect(calls).toEqual(['/api/ciunac/estudiantes', '/api/ciunac/solicitudes'])
  })

  it('never reports completion if the notification receipt is missing', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input)
      if (url.endsWith('/estudiantes')) return json({ id: 'student-1' })
      if (url.endsWith('/solicitudes')) return json({ id: 81 })
      return json({ ok: true }, 202)
    }))
    await expect(registerSolicitudConstancia({ solicitud: request() })).resolves.toMatchObject({
      status: 'saved_notification_failed', requestId: '81',
      error: { code: 'UNEXPECTED', message: 'La solicitud se guardo, pero el correo no pudo procesarse.' },
    })
  })

  it('preserves empty reads but does not hide malformed responses or server failures', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(json({}, 404))
      .mockResolvedValueOnce(json({}, 404))
      .mockResolvedValueOnce(json({ id: 81 }))
      .mockResolvedValueOnce(json({ error: { message: 'Servicio no disponible' } }, 503))
    vi.stubGlobal('fetch', fetcher)
    await expect(findConstanciaStudent('12345678')).resolves.toBeNull()
    await expect(getConstanciaCargo(81)).resolves.toBeNull()
    await expect(getConstanciaCargo(81)).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
    await expect(getConstanciaCargo(81)).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE', status: 503 })
  })
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function request(typeId: 5 | 6 = 5): SolicitudConstancia {
  return {
    email: 'user@example.com',
    basicData: {
      typeId, languageId: 2, levelId: 1, names: 'Maria', lastNames: 'Perez', documentType: 'DNI',
      documentNumber: '12345678', phone: '999888777', existingStudentId: null, isUnacStudent: false,
    },
    payment: { amount: 30, voucher: {
      number: '123456789012345', paidAt: '2026-08-01T00:00:00.000Z', url: '/voucher.png',
    } },
  }
}
