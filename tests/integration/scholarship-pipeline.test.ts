import { afterEach, describe, expect, it, vi } from 'vitest'
import { registerSolicitudBeca, retrySolicitudBecaNotification } from '@/modules/solicitud-beca/client'
import type { SolicitudBeca } from '@/modules/solicitud-beca/model'
import { obtenerPeriodo } from '@/lib/utils'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('scholarship public pipeline', () => {
  it.each([{ _id: 'beca-1' }, { id: 'beca-1' }])('preserves the DTO, sequence and identifier %j', async (response) => {
    const calls: Array<{ url: string; body: unknown }> = []
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      expect(init?.method).toBe('POST')
      expect(new Headers(init?.headers).has('x-api-key')).toBe(false)
      const url = String(input)
      calls.push({ url, body: JSON.parse(String(init?.body)) })
      return json(url.endsWith('/solicitudbecas') ? response : { ok: true, receiptId: 'receipt-1' })
    }))

    await expect(registerSolicitudBeca(scholarship())).resolves.toEqual({
      status: 'completed', requestId: 'beca-1', notificationReceiptId: 'receipt-1',
    })
    expect(calls).toEqual([
      { url: '/api/ciunac/solicitudbecas', body: {
        nombres: 'MARIA', apellidos: 'PEREZ', telefono: '999888777', tipo_documento: 'DNI',
        numero_documento: '12345678', facultad: 'Ingenieria', facultadId: '1',
        escuela: 'Sistemas', escuelaId: '2', codigo: '20260001', direccion: 'CALLAO',
        email: 'user@example.com', periodo: obtenerPeriodo(),
        constancia_matricula: '/files/matricula.pdf', historial_academico: '/files/historial.pdf',
        contancia_tercio: '/files/tercio.pdf', carta_de_compromiso: '/files/compromiso.pdf',
        declaracion_jurada: '/files/declaracion.pdf',
      } },
      { url: '/api/security/notifications', body: { type: 'BECA', reference: 'beca-1' } },
    ])
  })

  it.each(['empty', 'null', 'incomplete', 'invalid-json'])('stops before mail on %s response', async (kind) => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => {
      if (kind === 'empty') return new Response(null, { status: 204 })
      if (kind === 'invalid-json') return new Response('{invalid', { status: 200 })
      return json(kind === 'null' ? null : {})
    })
    vi.stubGlobal('fetch', fetcher)
    await expect(registerSolicitudBeca(scholarship())).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('does not retry a lost write response or send mail', async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'))
    vi.stubGlobal('fetch', fetcher)
    await expect(registerSolicitudBeca(scholarship())).rejects.toMatchObject({ code: 'NETWORK', retryable: true })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it.each([401, 403, 503])('preserves mail status %s and retries only notification', async (status) => {
    const calls: string[] = []
    let mailAttempts = 0
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input)
      calls.push(url)
      if (url.endsWith('/solicitudbecas')) return json({ _id: 'beca-1' })
      mailAttempts += 1
      return mailAttempts === 1
        ? json({ error: { message: 'No se pudo procesar el correo.' }, correlationId: 'mail-test' }, status)
        : json({ ok: true, receiptId: 'retry-receipt' }, 202)
    }))

    await expect(registerSolicitudBeca(scholarship())).resolves.toMatchObject({
      status: 'saved_notification_failed', requestId: 'beca-1',
      error: {
        code: status === 401 ? 'AUTHENTICATION' : status === 403 ? 'AUTHORIZATION' : 'EXTERNAL_SERVICE',
        status, correlationId: 'mail-test', retryable: status === 503,
      },
    })
    await expect(retrySolicitudBecaNotification('beca-1')).resolves.toBe('retry-receipt')
    expect(calls).toEqual([
      '/api/ciunac/solicitudbecas', '/api/security/notifications', '/api/security/notifications',
    ])
  })
})

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function scholarship(): SolicitudBeca {
  return {
    email: 'user@example.com',
    basicData: {
      names: 'Maria', lastNames: 'Perez', phone: '999888777', documentType: 'DNI',
      documentNumber: '12345678', address: 'Callao', studentCode: '20260001',
      faculty: { id: 1, name: 'Ingenieria' }, school: { id: 2, name: 'Sistemas' },
    },
    documents: {
      enrollmentCertificateUrl: '/files/matricula.pdf', academicHistoryUrl: '/files/historial.pdf',
      meritCertificateUrl: '/files/tercio.pdf', commitmentLetterUrl: '/files/compromiso.pdf',
      swornDeclarationUrl: '/files/declaracion.pdf',
    },
  }
}
