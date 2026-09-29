import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { findConsultationRequests, getConsultationRequests } from '@/modules/consultas/server'
import { getLocationConsultation } from '@/modules/consulta-ubicacion/server'
import { findDigitalDocument, confirmDigitalDocumentAcceptance } from '@/modules/consulta-solicitud/infrastructure/digital-document.client'

beforeEach(() => {
  vi.stubEnv('API_URL', 'https://ciunac.test')
  vi.stubEnv('API_KEY', 'integration-consultation-key')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('consultation server contracts', () => {
  it.each([
    ['CERTIFICADO', [1, 5]],
    ['EXAMEN', [7]],
  ] as const)('keeps the %s CAPTCHA lookup to a single request without texts', async (type, ids) => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      expect(String(input)).toBe('https://ciunac.test/solicitudes/documento/12345678')
      expect(init?.cache).toBe('no-store')
      return json([requestDto(1), requestDto(5), requestDto(7)])
    })
    vi.stubGlobal('fetch', fetcher)
    const result = await findConsultationRequests({ documentNumber: ' 12345678 ', type })
    expect(result.documentNumber).toBe('12345678')
    expect(result.requests.map(({ id }) => id)).toEqual(ids)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('loads requests and texts concurrently without caching private data', async () => {
    const pending: Array<() => void> = []
    const fetcher = vi.fn<typeof fetch>().mockImplementation((input, init) => {
      expect(init?.cache).toBe('no-store')
      expect(new Headers(init?.headers).get('x-api-key')).toBe('integration-consultation-key')
      return new Promise((resolve) => pending.push(() => resolve(json(
        String(input).endsWith('/textos') ? texts() : [requestDto(1), requestDto(5), requestDto(7)],
      ))))
    })
    vi.stubGlobal('fetch', fetcher)
    const result = getConsultationRequests({ documentNumber: ' 12345678 ', type: 'CERTIFICADO' })
    expect(fetcher).toHaveBeenCalledTimes(2)
    pending.forEach((resolve) => resolve())
    await expect(result).resolves.toMatchObject({
      documentNumber: '12345678', requests: [{ id: 1 }, { id: 5 }], textStatus: 'available',
    })
  })

  it.each([null, []])('keeps legitimate empty requests distinct from a failed provider: %j', async (body) => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input) =>
      json(String(input).endsWith('/textos') ? texts() : body)))
    await expect(getConsultationRequests({ documentNumber: '12345678', type: 'CERTIFICADO' }))
      .resolves.toMatchObject({ requests: [], textStatus: 'available' })
  })

  it('does not hide requests when auxiliary texts fail', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input) =>
      String(input).endsWith('/textos') ? json({}, 503) : json([requestDto(5)])))
    await expect(getConsultationRequests({ documentNumber: '12345678', type: 'CERTIFICADO' }))
      .resolves.toMatchObject({ requests: [{ id: 5 }], texts: [], textStatus: 'unavailable' })
  })

  it('rejects invalid documents before contacting any provider', async () => {
    const fetcher = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetcher)
    await expect(getConsultationRequests({ documentNumber: '../12345', type: 'CERTIFICADO' }))
      .rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(getLocationConsultation({ documentNumber: '../12345' }))
      .rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(findConsultationRequests({ documentNumber: '../12345', type: 'EXAMEN' }))
      .rejects.toMatchObject({ code: 'VALIDATION' })
    expect(fetcher).not.toHaveBeenCalled()
  })
})

describe('location consultation server pipeline', () => {
  it('starts all independent reads together and builds cargo without fetching the request again', async () => {
    const pending: Array<() => void> = []
    const paths: string[] = []
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation((input, init) => {
      const path = new URL(String(input)).pathname
      paths.push(path)
      expect(init?.cache).toBe('no-store')
      return new Promise((resolve) => pending.push(() => resolve(json(locationResponse(path)))))
    }))
    const result = getLocationConsultation({ documentNumber: '12345678' })
    expect(paths.sort()).toEqual([
      '/ciclos', '/detallesubicacion/estudiante/documento/12345678', '/examenesubicacion',
      '/solicitudes/documento/12345678', '/textos',
    ])
    pending.forEach((resolve) => resolve())
    await expect(result).resolves.toMatchObject({
      activeRequestId: 7, cargo: { requestId: 7, amount: 30 },
      results: [{ id: 601, certificateAvailable: true }],
    })
    expect(paths).toHaveLength(5)
  })

  it('returns an empty result with cargo when no grade exists', async () => {
    locationFetch({ '/detallesubicacion/estudiante/documento/12345678': [] })
    await expect(getLocationConsultation({ documentNumber: '12345678' }))
      .resolves.toMatchObject({ results: [], cargo: { requestId: 7, amount: 30 } })
  })

  it('keeps grades visible without texts and disables certificate generation', async () => {
    locationFetch({ '/textos': new Response(null, { status: 503 }) })
    await expect(getLocationConsultation({ documentNumber: '12345678' }))
      .resolves.toMatchObject({ textStatus: 'unavailable', results: [{ certificateAvailable: false }] })
  })

  it.each(['/ciclos', '/examenesubicacion', '/detallesubicacion/estudiante/documento/12345678'])(
    'rejects malformed %s without confusing it with absence', async (path) => {
      locationFetch({ [path]: [{}] })
      await expect(getLocationConsultation({ documentNumber: '12345678' }))
        .rejects.toMatchObject({ code: 'EXTERNAL_SERVICE' })
    },
  )

  it('returns null when no owned request exists', async () => {
    locationFetch({ '/solicitudes/documento/12345678': [] })
    await expect(getLocationConsultation({ documentNumber: '12345678' })).resolves.toBeNull()
  })
})

describe('digital document HTTP compatibility', () => {

  it.each(['certificate', 'constancia'] as const)('reads and accepts %s without sending an API key', async (kind) => {
    const collection = kind === 'certificate' ? 'certificados' : 'constancias'
    const calls: Array<{ url: string; method: string; body: unknown }> = []
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      expect(new Headers(init?.headers).has('x-api-key')).toBe(false)
      calls.push({ url: String(input), method: init?.method ?? 'GET', body: init?.body ? JSON.parse(String(init.body)) : null })
      if (init?.method === 'PATCH') return new Response(null, { status: 204 })
      const dto = { _id: 'DOC-1', id: 'DOC-1', solicitudId: 1, numeroDocumento: 12345678,
        idioma: 'INGLES', nivel: 'BASICO', tipo: 'ESTUDIOS', url: 'https://files.test/doc.pdf', aceptado: false }
      return json(kind === 'constancia' ? [dto] : dto)
    }))
    await expect(findDigitalDocument({ kind, requestId: 1 }))
      .resolves.toMatchObject({ id: 'DOC-1', kind, requestId: 1, documentNumber: '12345678' })
    await confirmDigitalDocumentAcceptance({ kind, documentId: 'DOC-1' })
    expect(calls).toEqual([
      { url: `/api/ciunac/${collection}/solicitud/1`, method: 'GET', body: null },
      { url: `/api/ciunac/${collection}/DOC-1`, method: 'PATCH', body: { aceptado: true, fechaAceptacion: expect.any(String) } },
    ])
  })

  it('preserves a failed acceptance and performs no retry or following request', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(json({ error: { message: 'No autorizado' }, correlationId: 'denied' }, 403))
    vi.stubGlobal('fetch', fetcher)
    await expect(confirmDigitalDocumentAcceptance({ kind: 'certificate', documentId: 'DOC-1' }))
      .rejects.toMatchObject({ code: 'AUTHORIZATION', status: 403, correlationId: 'denied', retryable: false })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function requestDto(id: number) {
  return { id, tipoSolicitudId: id, estadoId: 1, creadoEn: '2026-08-01T00:00:00.000Z', pago: 30,
    numeroVoucher: '123456789012345', fechaPago: '2026-08-01T00:00:00.000Z', digital: false,
    estudiante: { id: 'student-1', nombres: 'MARIA', apellidos: 'PEREZ', numeroDocumento: '12345678' },
    tiposSolicitud: { id, solicitud: id === 7 ? 'EXAMEN DE UBICACION' : id === 5 ? 'CONSTANCIA' : 'CERTIFICADO' },
    idioma: { id: 2, nombre: 'INGLES' }, nivel: { id: 1, nombre: 'BASICO' },
    estado: { id: 1, nombre: 'NUEVO', referencia: 'REGISTRADO' } }
}

function texts() {
  return [{ codigo: 'TEXTO_NOMBREAN', contenido: 'ANO 2026' }]
}

function locationResponse(path: string): unknown {
  if (path === '/textos') return texts()
  if (path === '/ciclos') return [{ id: 2, nombre: 'BASICO 2' }]
  if (path === '/examenesubicacion') return [{ id: 501, fecha: '2026-08-01T00:00:00.000Z' }]
  if (path === '/solicitudes/documento/12345678') return [requestDto(7)]
  if (path === '/detallesubicacion/estudiante/documento/12345678') return [{ id: 601, examenId: 501,
    solicitudId: 7, nota: 88, terminado: true, idioma: { id: 2, nombre: 'INGLES' },
    nivel: { id: 1, nombre: 'BASICO' }, calificacion: { cicloId: 2 } }]
  throw new Error(`Unexpected test path: ${path}`)
}

function locationFetch(overrides: Record<string, unknown>) {
  vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input) => {
    const path = new URL(String(input)).pathname
    const value = path in overrides ? overrides[path] : locationResponse(path)
    return value instanceof Response ? value : json(value)
  }))
}
