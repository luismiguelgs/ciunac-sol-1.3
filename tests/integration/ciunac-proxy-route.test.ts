import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import {
  GET,
  PATCH,
  POST,
} from '@/app/api/ciunac/[...path]/route'
import {
  writeConsultationSession,
  writeVerifiedSession,
} from '@/modules/security/server/session'
import type { ConsultationType, OtpPurpose } from '@/modules/security/domain/security.types'
import { obtenerPeriodo } from '@/lib/utils'
import {
  getLocationEntryData, writeLocationProfile, validateLocationRequest, validateLocationStudentRequest,
} from '@/modules/solicitud-ubicacion/server'

const originalEnvironment = { ...process.env }

beforeEach(() => {
  process.env.API_URL = 'https://ciunac.test'
  process.env.API_KEY = 'integration-private-key'
  process.env.APP_BASE_URL = 'http://localhost:3000'
  process.env.OTP_SESSION_SECRET = 'integration-session-secret-with-at-least-32-bytes'
})

afterEach(() => {
  process.env = { ...originalEnvironment }
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('CIUNAC BFF route authorization', () => {
  it('rejects a request type that does not match the verified purpose before upstream', async () => {
    const fetcher = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetcher)

    const response = await callPost(
      ['solicitudes'],
      requestPayload(5),
      verifiedCookie('CERTIFICADO'),
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toMatchObject({ error: { code: 'FORBIDDEN' } })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('rejects a student email different from the verified email before upstream', async () => {
    const fetcher = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetcher)

    const response = await callPost(
      ['estudiantes'],
      studentPayload('other@example.com'),
      verifiedCookie('CERTIFICADO', 'verified@example.com'),
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toMatchObject({ error: { code: 'FORBIDDEN' } })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('rejects scholarship creation from a certificate session before parsing or forwarding', async () => {
    const fetcher = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetcher)

    const response = await callPost(
      ['solicitudbecas'],
      {},
      verifiedCookie('CERTIFICADO'),
    )

    expect(response.status).toBe(403)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('rejects a scholarship email different from the verified email before upstream', async () => {
    const fetcher = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetcher)

    const response = await callPost(
      ['solicitudbecas'],
      scholarshipPayload('other@example.com'),
      verifiedCookie('BECA', 'verified@example.com'),
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toMatchObject({ error: { code: 'FORBIDDEN' } })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('canonicalizes scholarship catalogs and period before persistence', async () => {
    const fetcher = scholarshipFetcher()
    vi.stubGlobal('fetch', fetcher)

    const response = await callPost(
      ['solicitudbecas'],
      {
        ...scholarshipPayload('verified@example.com'),
        facultad: 'NOMBRE MANIPULADO',
        escuela: 'OTRO NOMBRE',
        periodo: '190001',
      },
      verifiedCookie('BECA', 'verified@example.com'),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ id: 'BECA-INTEGRATION' })

    const persistenceCall = fetcher.mock.calls.find(([input]) => String(input).endsWith('/solicitudbecas'))
    expect(persistenceCall).toBeDefined()
    expect(JSON.parse(String(persistenceCall?.[1]?.body))).toMatchObject({
      facultad: 'FACULTAD CANONICA',
      facultadId: '1',
      escuela: 'ESCUELA CANONICA',
      escuelaId: '2',
      periodo: obtenerPeriodo(),
    })
  })

  it('rejects a school that does not belong to the selected faculty before persistence', async () => {
    const fetcher = scholarshipFetcher({ includeSecondFaculty: true })
    vi.stubGlobal('fetch', fetcher)

    const response = await callPost(
      ['solicitudbecas'],
      { ...scholarshipPayload('verified@example.com'), escuelaId: '3' },
      verifiedCookie('BECA', 'verified@example.com'),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({ error: { code: 'INVALID_REQUEST' } })
    expect(fetcher.mock.calls.filter(([input]) => String(input).endsWith('/solicitudbecas'))).toHaveLength(0)
  })

  it('does not expose public catalog proxy routes to the browser', async () => {
    const fetcher = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetcher)

    const response = await GET(
      new NextRequest('http://localhost:3000/api/ciunac/tipossolicitud'),
      routeContext(['tipossolicitud']),
    )

    expect(response.status).toBe(403)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('rejects a cargo whose request type belongs to another verified flow', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      tiposSolicitud: { id: 5, solicitud: 'CONSTANCIA DE ESTUDIOS' },
    }))
    vi.stubGlobal('fetch', fetcher)

    const response = await GET(
      requestWithCookie(
        'http://localhost:3000/api/ciunac/solicitudes/1003',
        verifiedCookie('CERTIFICADO'),
      ),
      routeContext(['solicitudes', '1003']),
    )

    expect(response.status).toBe(403)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(new Headers(fetcher.mock.calls[0][1]?.headers).get('x-api-key')).toBe('integration-private-key')
  })

  it('accepts a certificate request and invokes only its catalog and persistence operations', async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input)
      if (url.endsWith('/tipossolicitud')) {
        return jsonResponse([{ id: 1, solicitud: 'CERTIFICADO DE ESTUDIOS', precio: 30 }])
      }
      if (url.endsWith('/solicitudes')) return jsonResponse({ id: '1001' }, 201)
      return jsonResponse({ internal: 'unexpected request' }, 500)
    })
    vi.stubGlobal('fetch', fetcher)

    const response = await callPost(
      ['solicitudes'],
      requestPayload(1),
      verifiedCookie('CERTIFICADO'),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ id: '1001' })
    expect(fetcher.mock.calls.map(([input]) => String(input))).toEqual([
      'https://ciunac.test/tipossolicitud',
      'https://ciunac.test/solicitudes',
    ])
  })

  it('requires a certificate consultation session for digital documents', async () => {
    const fetcher = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetcher)

    const response = await GET(
      requestWithCookie(
        'http://localhost:3000/api/ciunac/certificados/solicitud/1001',
        consultationCookie('EXAMEN'),
      ),
      routeContext(['certificados', 'solicitud', '1001']),
    )

    expect(response.status).toBe(403)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('accepts a digital document with its consultation session and no OTP session', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ aceptado: true }))
    vi.stubGlobal('fetch', fetcher)

    const body = {
      aceptado: true,
      fechaAceptacion: '2026-09-01T12:00:00.000Z',
    }
    const response = await callPatch(
      ['constancias', 'CONST-E2E'],
      body,
      consultationCookie('CERTIFICADO'),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ aceptado: true })
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body))).toEqual(body)
  })
})

describe('location BFF contracts', () => {
  it('loads only price, texts and schedules on entry', async () => {
    const fetcher = locationFetcher()
    vi.stubGlobal('fetch', fetcher)
    await expect(getLocationEntryData()).resolves.toMatchObject({
      requestType: { id: 7, price: 30 }, texts: [{ code: 'TEXTO_NOMBREAN' }], schedules: [],
    })
    expect(fetcher.mock.calls.map(([input]) => new URL(String(input)).pathname).sort()).toEqual([
      '/cronogramaubicacion', '/textos', '/tipossolicitud',
    ])
  })

  it('rejects public validator calls without an UBICACION session', async () => {
    const fetcher = locationFetcher()
    vi.stubGlobal('fetch', fetcher)
    const request = new NextRequest('http://localhost:3000/api/ciunac/solicitudes')
    await expect(validateLocationRequest(request, {}, null)).rejects.toMatchObject({ code: 'FORBIDDEN' })
    expect(() => validateLocationStudentRequest(request, {}, null)).toThrowError()
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('rejects a non-CIUNAC intermediate level before any provider call', async () => {
    const fetcher = locationFetcher()
    vi.stubGlobal('fetch', fetcher)
    const response = await callPost(['solicitudes'], {
      documentNumber: '12345678', request: { ...requestPayload(7), nivelId: 2 },
    }, locationCookie())
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({ error: { code: 'INVALID_REQUEST' } })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('rejects letters in DNI before student persistence', async () => {
    const fetcher = locationFetcher()
    vi.stubGlobal('fetch', fetcher)
    const response = await callPost(['estudiantes'], {
      ...studentPayload('verified@example.com'), numeroDocumento: 'A2345678', imgDoc: '/identity.pdf',
    }, locationCookie())
    expect(response.status).toBe(400)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('checks the authoritative price and duplicates before forwarding the unchanged request DTO', async () => {
    const fetcher = locationFetcher()
    vi.stubGlobal('fetch', fetcher)
    const dto = requestPayload(7)
    const response = await callPost(['solicitudes'], { documentNumber: '12345678', request: dto }, locationCookie())
    expect(response.status).toBe(200)
    expect(fetcher.mock.calls.map(([input]) => new URL(String(input)).pathname)).toEqual([
      '/tipossolicitud', '/solicitudes/documento/12345678', '/solicitudes',
    ])
    expect(JSON.parse(String(fetcher.mock.calls[2][1]?.body))).toEqual(dto)
  })

  it('blocks duplicate registration using the same pending/type/language rule', async () => {
    const fetcher = locationFetcher(true)
    vi.stubGlobal('fetch', fetcher)
    const response = await callPost(['solicitudes'], {
      documentNumber: '12345678', request: requestPayload(7),
    }, locationCookie())
    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toMatchObject({ error: { code: 'DUPLICATE_REQUEST' } })
    expect(fetcher.mock.calls.some(([input]) => String(input).endsWith('/solicitudes'))).toBe(false)
  })
})

function locationCookie(): string {
  const response = NextResponse.json({ ok: true })
  writeLocationProfile(response, false)
  const profile = response.cookies.get('ciunac_location_profile')!
  return `${verifiedCookie('UBICACION')}; ${profile.name}=${profile.value}`
}

function locationFetcher(duplicate = false) {
  return vi.fn<typeof fetch>().mockImplementation(async (input) => {
    const path = new URL(String(input)).pathname
    if (path === '/tipossolicitud') return jsonResponse([{ id: 7, solicitud: 'EXAMEN DE UBICACION', precio: 30 }])
    if (path === '/textos') return jsonResponse([{ codigo: 'TEXTO_NOMBREAN', contenido: 'Ano academico 2026' }])
    if (path === '/cronogramaubicacion') return jsonResponse([])
    if (path === '/solicitudes/documento/12345678') return jsonResponse(duplicate
      ? [{ estadoId: 1, tipoSolicitudId: 7, idiomaId: 2 }]
      : [{ estadoId: 2, tipoSolicitudId: 7, idiomaId: 2 }])
    if (path === '/solicitudes') return jsonResponse({ id: 1002 }, 201)
    throw new Error('Unexpected provider request')
  })
}

function routeContext(path: string[]) {
  return { params: Promise.resolve({ path }) }
}

async function callPost(path: string[], body: unknown, cookie: string) {
  const serialized = JSON.stringify(body)
  const request = new NextRequest(`http://localhost:3000/api/ciunac/${path.join('/')}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': String(Buffer.byteLength(serialized)),
      Cookie: cookie,
      Origin: 'http://localhost:3000',
    },
    body: serialized,
  })
  return POST(request, routeContext(path))
}

async function callPatch(path: string[], body: unknown, cookie: string) {
  const serialized = JSON.stringify(body)
  const request = new NextRequest(`http://localhost:3000/api/ciunac/${path.join('/')}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': String(Buffer.byteLength(serialized)),
      Cookie: cookie,
      Origin: 'http://localhost:3000',
    },
    body: serialized,
  })
  return PATCH(request, routeContext(path))
}

function requestWithCookie(url: string, cookie: string) {
  return new NextRequest(url, { headers: { Cookie: cookie } })
}

function verifiedCookie(purpose: OtpPurpose, email = 'verified@example.com'): string {
  const response = NextResponse.json({ ok: true })
  writeVerifiedSession(response, email, purpose)
  const cookie = response.cookies.get('ciunac_verified_session')
  if (!cookie) throw new Error('Verified session cookie was not created')
  return `${cookie.name}=${cookie.value}`
}

function consultationCookie(type: ConsultationType): string {
  const response = NextResponse.json({ ok: true })
  writeConsultationSession(response, '12345678', type)
  const cookie = response.cookies.get('ciunac_consultation_session')
  if (!cookie) throw new Error('Consultation session cookie was not created')
  return `${cookie.name}=${cookie.value}`
}

function studentPayload(email: string) {
  return {
    nombres: 'MARIA',
    apellidos: 'PEREZ',
    tipoDocumento: 'DNI',
    numeroDocumento: '12345678',
    celular: '999888777',
    email,
  }
}

function requestPayload(typeId: number) {
  return {
    estudianteId: 'student-1',
    tipoSolicitudId: typeId,
    idiomaId: 2,
    nivelId: 1,
    estadoId: 1,
    periodo: '2026-I',
    alumnoCiunac: false,
    fechaPago: '2026-08-01T00:00:00.000Z',
    pago: 30,
    digital: typeId === 5 || typeId === 6,
    numeroVoucher: '123456789012345',
    imgVoucher: '/vouchers/test.png',
  }
}

function scholarshipPayload(email: string) {
  return {
    nombres: 'MARIA',
    apellidos: 'PEREZ',
    telefono: '999888777',
    tipo_documento: 'DNI',
    numero_documento: '12345678',
    facultad: 'INGENIERIA',
    facultadId: '1',
    escuela: 'SISTEMAS',
    escuelaId: '2',
    codigo: '20260001',
    direccion: 'CALLAO',
    email,
    periodo: '2026-I',
    carta_de_compromiso: '/becas/carta.pdf',
    historial_academico: '/becas/historial.pdf',
    constancia_matricula: '/becas/matricula.pdf',
    contancia_tercio: '/becas/tercio.pdf',
    declaracion_jurada: '/becas/declaracion.pdf',
  }
}

function scholarshipFetcher(options: { includeSecondFaculty?: boolean } = {}) {
  return vi.fn<typeof fetch>().mockImplementation(async (input) => {
    const url = String(input)
    if (url.endsWith('/facultades')) {
      return jsonResponse([
        { id: 1, nombre: 'FACULTAD CANONICA', codigo: 'FC' },
        ...(options.includeSecondFaculty
          ? [{ id: 2, nombre: 'SEGUNDA FACULTAD', codigo: 'SF' }]
          : []),
      ])
    }
    if (url.endsWith('/escuelas')) {
      return jsonResponse([
        { id: 2, nombre: 'ESCUELA CANONICA', facultadId: 1 },
        ...(options.includeSecondFaculty
          ? [{ id: 3, nombre: 'ESCUELA DE OTRA FACULTAD', facultadId: 2 }]
          : []),
      ])
    }
    if (url.endsWith('/solicitudbecas')) return jsonResponse({ id: 'BECA-INTEGRATION' }, 201)
    return jsonResponse({ internal: 'unexpected request' }, 500)
  })
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
