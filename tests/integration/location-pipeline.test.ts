import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  registerSolicitudUbicacion, retrySolicitudUbicacionNotification,
  findLocationStudent, getLocationCargo, checkDuplicateSolicitudUbicacion,
} from '@/modules/solicitud-ubicacion/client'
import type { SolicitudUbicacion } from '@/modules/solicitud-ubicacion/model'
import { obtenerPeriodo } from '@/lib/utils'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('location public pipeline', () => {
  it.each([
    { ciunac: false, existing: false }, { ciunac: true, existing: false },
    { ciunac: false, existing: true }, { ciunac: true, existing: true },
  ])('preserves DTOs and call order for $ciunac CIUNAC / $existing existing', async ({ ciunac, existing }) => {
    const calls: Array<{ url: string; method: string | undefined; body: unknown }> = []
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      const url = String(input)
      expect(new Headers(init?.headers).has('x-api-key')).toBe(false)
      calls.push({ url, method: init?.method, body: JSON.parse(String(init?.body)) })
      if (url.includes('/estudiantes')) return json({ id: 'student-1' })
      if (url.endsWith('/solicitudes')) return json({ id: 1002 })
      return json({ ok: true, receiptId: 'receipt-1' }, 202)
    }))

    await expect(registerSolicitudUbicacion({ solicitud: location(ciunac, existing) })).resolves.toEqual({
      status: 'completed', requestId: '1002', notificationReceiptId: 'receipt-1',
    })
    expect(calls).toEqual([
      { url: '/api/ciunac/estudiantes' + (existing ? '/student-1' : ''), method: existing ? 'PATCH' : 'POST',
        body: {
          nombres: 'MARIA', apellidos: 'PEREZ', tipoDocumento: 'DNI', numeroDocumento: '12345678',
          celular: '999888777', email: 'user@example.com', imgDoc: '/identity.pdf',
        },
      },
      { url: '/api/ciunac/solicitudes', method: 'POST', body: {
        documentNumber: '12345678',
        request: {
          estudianteId: 'student-1', tipoSolicitudId: 7, idiomaId: 2, nivelId: ciunac ? 2 : 1,
          estadoId: 1, periodo: obtenerPeriodo(), alumnoCiunac: ciunac,
          fechaPago: '2026-08-01T00:00:00.000Z', pago: 30, digital: false,
          numeroVoucher: '123456789012345', imgVoucher: '/voucher.pdf',
          ...(ciunac ? { imgCertEstudio: '/study.pdf' } : {}),
        },
      } },
      { url: '/api/security/notifications', method: 'POST', body: { type: 'UBICACION', reference: '1002' } },
    ])
  })

  it.each(['estudiantes', 'solicitudes'].flatMap(resource =>
    ['empty', 'null', 'incomplete', 'invalid-json'].map(kind => ({ resource, kind })),
  ))('stops on $resource $kind without mail or repeated writes', async ({ resource, kind }) => {
    const calls: string[] = []
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input)
      calls.push(url)
      if (!url.endsWith('/' + resource)) return json({ id: 'student-1' })
      if (kind === 'empty') return new Response(null, { status: 204 })
      if (kind === 'invalid-json') return new Response('{invalid', { status: 200 })
      return json(kind === 'null' ? null : {})
    }))
    await expect(registerSolicitudUbicacion({ solicitud: location() })).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
    expect(calls).toEqual(resource === 'estudiantes'
      ? ['/api/ciunac/estudiantes']
      : ['/api/ciunac/estudiantes', '/api/ciunac/solicitudes'])
  })

  it('preserves a lost request response without automatic retry', async () => {
    const calls: string[] = []
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input)
      calls.push(url)
      if (url.endsWith('/estudiantes')) return json({ id: 'student-1' })
      throw new TypeError('Failed to fetch')
    }))
    await expect(registerSolicitudUbicacion({ solicitud: location() })).rejects.toMatchObject({ code: 'NETWORK', retryable: true })
    expect(calls).toEqual(['/api/ciunac/estudiantes', '/api/ciunac/solicitudes'])
  })

  it('retains the saved ID and retries only mail with error metadata intact', async () => {
    const calls: string[] = []
    let mailAttempts = 0
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input)
      calls.push(url)
      if (url.endsWith('/estudiantes')) return json({ id: 'student-1' })
      if (url.endsWith('/solicitudes')) return json({ id: 1002 })
      mailAttempts += 1
      return mailAttempts === 1
        ? json({ error: { message: 'Operacion no permitida.' }, correlationId: 'location-mail' }, 403)
        : json({ ok: true, receiptId: 'retry-receipt' }, 202)
    }))
    await expect(registerSolicitudUbicacion({ solicitud: location() })).resolves.toMatchObject({
      status: 'saved_notification_failed', requestId: '1002',
      error: { code: 'AUTHORIZATION', status: 403, correlationId: 'location-mail', retryable: false },
    })
    await expect(retrySolicitudUbicacionNotification('1002')).resolves.toBe('retry-receipt')
    expect(calls).toEqual([
      '/api/ciunac/estudiantes', '/api/ciunac/solicitudes',
      '/api/security/notifications', '/api/security/notifications',
    ])
  })

  it('rejects invalid inputs before reaching HTTP', async () => {
    const fetcher = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetcher)
    await expect(registerSolicitudUbicacion({ solicitud: { ...location(), email: '' } })).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(findLocationStudent('bad')).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(getLocationCargo(0)).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(checkDuplicateSolicitudUbicacion({ documentNumber: 'bad', languageId: 2 })).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each(['student', 'cargo', 'duplicate'] as const)('distinguishes a legitimate empty %s read', async (kind) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(kind === 'duplicate' ? json([]) : json({}, 404))
    vi.stubGlobal('fetch', fetcher)
    if (kind === 'student') await expect(findLocationStudent(' 12345678 ')).resolves.toBeNull()
    if (kind === 'cargo') await expect(getLocationCargo(1002)).resolves.toBeNull()
    if (kind === 'duplicate') await expect(checkDuplicateSolicitudUbicacion({ documentNumber: '12345678', languageId: 2 })).resolves.toBe(false)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function location(ciunac = false, existing = false): SolicitudUbicacion {
  return {
    email: 'user@example.com', isCiunacStudent: ciunac,
    basicData: {
      languageId: 2, levelId: ciunac ? 2 : 1, names: 'Maria', lastNames: 'Perez',
      documentType: 'DNI', documentNumber: '12345678', phone: '999888777',
      identityDocumentUrl: '/identity.pdf', existingStudentId: existing ? 'student-1' : null,
    },
    payment: {
      amount: 30, voucher: {
        number: '123456789012345', paidAt: '2026-08-01T00:00:00.000Z', url: '/voucher.pdf',
      },
    },
    studyCertificateUrl: ciunac ? '/study.pdf' : null,
  }
}
