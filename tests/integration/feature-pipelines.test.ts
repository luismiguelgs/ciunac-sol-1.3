import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSolicitudConsultation } from '@/modules/consulta-solicitud/server'
import type { SolicitudCertificado } from '@/modules/solicitud-certificado/domain/solicitud-certificado'
import {
  registerSolicitudCertificado,
  retrySolicitudCertificadoNotification,
} from '@/modules/solicitud-certificado/client'

const originalEnvironment = { ...process.env }

afterEach(() => {
  process.env = { ...originalEnvironment }
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('certificate registration pipeline', () => {
  it('crosses application, gateways and HTTP with the expected DTOs', async () => {
    const requests: Array<{ url: string; body: unknown }> = []
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      const url = String(input)
      requests.push({
        url,
        body: typeof init?.body === 'string' ? JSON.parse(init.body) : null,
      })

      if (url.endsWith('/estudiantes')) return jsonResponse({ id: 'student-1' })
      if (url.endsWith('/solicitudes')) return jsonResponse({ id: 'request-1' })
      if (url.endsWith('/api/security/notifications')) {
        return jsonResponse({ ok: true, receiptId: 'receipt-1' }, 202)
      }
      return jsonResponse({ error: { message: 'Unexpected integration request' } }, 500)
    }))

    await expect(registerSolicitudCertificado({ solicitud: certificateRequest() })).resolves.toEqual({
      status: 'completed',
      requestId: 'request-1',
      notificationReceiptId: 'receipt-1',
    })

    expect(requests.map(({ url }) => url)).toEqual([
      '/api/ciunac/estudiantes',
      '/api/ciunac/solicitudes',
      '/api/security/notifications',
    ])
    expect(requests[0].body).toMatchObject({
      nombres: 'MARIA',
      apellidos: 'PEREZ',
      numeroDocumento: '12345678',
    })
    expect(requests[1].body).toMatchObject({
      estudianteId: 'student-1',
      tipoSolicitudId: 1,
      pago: 30,
      numeroVoucher: '123456789012345',
    })
  })

  it('retries only notification after a persisted request', async () => {
    let studentWrites = 0
    let requestWrites = 0
    let notifications = 0
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input)
      if (url.endsWith('/estudiantes')) {
        studentWrites += 1
        return jsonResponse({ id: 'student-1' })
      }
      if (url.endsWith('/solicitudes')) {
        requestWrites += 1
        return jsonResponse({ id: 'request-1' })
      }
      if (url.endsWith('/api/security/notifications')) {
        notifications += 1
        return notifications === 1
          ? jsonResponse({ error: { message: 'Correo temporalmente no disponible' } }, 503)
          : jsonResponse({ ok: true, receiptId: 'receipt-retry' }, 202)
      }
      return jsonResponse({}, 500)
    }))

    await expect(registerSolicitudCertificado({ solicitud: certificateRequest() })).resolves.toMatchObject({
      status: 'saved_notification_failed',
      requestId: 'request-1',
    })
    await expect(retrySolicitudCertificadoNotification('request-1')).resolves.toBe('receipt-retry')
    expect({ studentWrites, requestWrites, notifications }).toEqual({
      studentWrites: 1,
      requestWrites: 1,
      notifications: 2,
    })
  })
})

describe('request consultation pipeline', () => {
  it('loads and maps requests through the server-only public API', async () => {
    process.env.API_URL = 'https://ciunac.test'
    process.env.API_KEY = 'integration-private-key'
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      const url = String(input)
      expect(new Headers(init?.headers).get('x-api-key')).toBe('integration-private-key')
      if (url.endsWith('/solicitudes/documento/12345678')) return jsonResponse([consultedRequestResponse()])
      if (url.endsWith('/textos')) return jsonResponse([{ codigo: 'TEXTO_1_FINAL', contenido: 'Entrega programada' }])
      return jsonResponse({}, 404)
    })
    vi.stubGlobal('fetch', fetcher)

    await expect(getSolicitudConsultation({ documentNumber: ' 12345678 ' })).resolves.toMatchObject({
      documentNumber: '12345678',
      textStatus: 'available',
      requests: [{ id: 1001, requestType: { kind: 'certificate' } }],
      texts: [{ code: 'TEXTO_1_FINAL', content: 'Entrega programada' }],
    })
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('rejects a malformed provider response instead of returning an empty success', async () => {
    process.env.API_URL = 'https://ciunac.test'
    process.env.API_KEY = 'integration-private-key'
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input) => (
      String(input).endsWith('/textos')
        ? jsonResponse([])
        : jsonResponse([{ id: 1001 }])
    )))

    await expect(getSolicitudConsultation({ documentNumber: '12345678' })).rejects.toMatchObject({
      code: 'EXTERNAL_SERVICE',
    })
  })
})

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function certificateRequest(): SolicitudCertificado {
  return {
    email: 'user@example.com',
    basicData: {
      typeId: 1,
      languageId: 2,
      levelId: 1,
      names: 'Maria',
      lastNames: 'Perez',
      documentType: 'DNI',
      documentNumber: '12345678',
      phone: '999888777',
      existingStudentId: null,
      isUnacStudent: false,
    },
    payment: {
      amount: 30,
      voucher: {
        number: '123456789012345',
        paidAt: '2026-08-01T00:00:00.000Z',
        url: '/vouchers/fixture.png',
      },
    },
  }
}

function consultedRequestResponse() {
  return {
    id: 1001,
    tipoSolicitudId: 1,
    estadoId: 1,
    creadoEn: '2026-08-01T00:00:00.000Z',
    pago: 30,
    numeroVoucher: '123456789012345',
    fechaPago: '2026-08-01T00:00:00.000Z',
    digital: false,
    observaciones: null,
    estudiante: { id: 'student-1', nombres: 'Maria', apellidos: 'Perez', numeroDocumento: '12345678' },
    tiposSolicitud: { id: 1, solicitud: 'CERTIFICADO DE ESTUDIOS' },
    idioma: { id: 2, nombre: 'INGLES' },
    nivel: { id: 1, nombre: 'BASICO' },
    estado: { id: 1, nombre: 'NUEVO', referencia: 'REGISTRADO' },
  }
}
