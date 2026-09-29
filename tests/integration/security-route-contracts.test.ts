import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { POST as requestOtp } from '@/app/api/security/otp/request/route'
import { POST as verifyOtp } from '@/app/api/security/otp/verify/route'
import { POST as consultByDocument } from '@/app/api/security/consulta/route'
import { POST as sendNotification } from '@/app/api/security/notifications/route'
import {
  readConsultationSessionFromRequest,
  readOtpChallenge,
  readVerifiedSessionFromRequest,
  writeVerifiedSession,
} from '@/modules/security/server/session'

const originalEnvironment = { ...process.env }

beforeEach(() => {
  process.env.API_URL = 'https://ciunac.test'
  process.env.API_KEY = 'integration-private-key'
  process.env.APP_BASE_URL = 'http://localhost:3000'
  process.env.RECAPTCHA_SECRET_KEY = 'integration-recaptcha-secret'
  process.env.OTP_SESSION_SECRET = 'integration-session-secret-with-at-least-32-bytes'
})

afterEach(() => {
  process.env = { ...originalEnvironment }
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('security Route Handler contracts', () => {
  it('requests and verifies an OTP while preserving response and cookie contracts', async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input)
      if (url.includes('google.com/recaptcha/api/siteverify')) {
        return jsonResponse({ success: true })
      }
      if (url.endsWith('/mailer')) return new Response(null, { status: 204 })
      return jsonResponse({ internal: 'unexpected request' }, 500)
    })
    vi.stubGlobal('fetch', fetcher)

    const requestResponse = await requestOtp(jsonRequest(
      '/api/security/otp/request',
      {
        email: 'User@Example.com',
        purpose: 'CERTIFICADO',
        captchaToken: 'valid-captcha-token',
      },
    ))

    expect(requestResponse.status).toBe(202)
    await expect(requestResponse.json()).resolves.toEqual({
      ok: true,
      expiresInSeconds: 300,
      resendInSeconds: 180,
    })
    expectCookieContract(requestResponse, 'ciunac_otp_challenge', 900)

    const mailCall = fetcher.mock.calls.find(([input]) => String(input).endsWith('/mailer'))
    expect(mailCall).toBeDefined()
    const mailPayload = JSON.parse(String(mailCall?.[1]?.body)) as { number: number }
    const challengeCookie = cookieHeader(requestResponse, 'ciunac_otp_challenge')
    const challengeRequest = requestWithCookie('/api/security/otp/verify', challengeCookie)
    expect(readOtpChallenge(challengeRequest)).toMatchObject({
      email: 'user@example.com',
      purpose: 'CERTIFICADO',
      attemptsRemaining: 5,
    })

    const verifyResponse = await verifyOtp(jsonRequest(
      '/api/security/otp/verify',
      {
        email: 'user@example.com',
        purpose: 'CERTIFICADO',
        code: String(mailPayload.number),
      },
      challengeCookie,
    ))

    expect(verifyResponse.status).toBe(200)
    await expect(verifyResponse.json()).resolves.toEqual({ ok: true })
    expectCookieContract(verifyResponse, 'ciunac_verified_session', 900)
    expect(verifyResponse.cookies.get('ciunac_otp_challenge')).toMatchObject({ maxAge: 0 })

    const verifiedRequest = requestWithCookie(
      '/api/security/notifications',
      cookieHeader(verifyResponse, 'ciunac_verified_session'),
    )
    expect(readVerifiedSessionFromRequest(verifiedRequest, 'CERTIFICADO')).toMatchObject({
      email: 'user@example.com',
      purpose: 'CERTIFICADO',
    })
  })

  it('creates a consultation session only when a matching request exists', async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input)
      if (url.includes('google.com/recaptcha/api/siteverify')) {
        return jsonResponse({ success: true })
      }
      if (url.endsWith('/solicitudes/documento/77294050')) {
        return jsonResponse([consultedRequestResponse()])
      }
      return jsonResponse({ internal: 'unexpected request' }, 500)
    })
    vi.stubGlobal('fetch', fetcher)

    const response = await consultByDocument(jsonRequest(
      '/api/security/consulta',
      {
        documento: '77294050',
        type: 'CERTIFICADO',
        captchaToken: 'valid-captcha-token',
      },
    ))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true, found: true })
    expectCookieContract(response, 'ciunac_consultation_session', 600)

    const sessionRequest = requestWithCookie(
      '/consulta-solicitud/77294050',
      cookieHeader(response, 'ciunac_consultation_session'),
    )
    expect(readConsultationSessionFromRequest(sessionRequest)).toMatchObject({
      documento: '77294050',
      type: 'CERTIFICADO',
    })
  })

  it('returns an explicit empty consultation without creating a session', async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input)
      if (url.includes('google.com/recaptcha/api/siteverify')) {
        return jsonResponse({ success: true })
      }
      if (url.endsWith('/solicitudes/documento/77294050')) return jsonResponse([])
      return jsonResponse({ internal: 'unexpected request' }, 500)
    })
    vi.stubGlobal('fetch', fetcher)

    const response = await consultByDocument(jsonRequest(
      '/api/security/consulta',
      {
        documento: '77294050',
        type: 'CERTIFICADO',
        captchaToken: 'valid-captcha-token',
      },
    ))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true, found: false })
    expect(response.cookies.get('ciunac_consultation_session')).toBeUndefined()
  })

  it('sends a compatible notification and issues a receipt without exposing provider data', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetcher)

    const response = await sendNotification(jsonRequest(
      '/api/security/notifications',
      { type: 'CERTIFICADO', reference: '1001' },
      verifiedCookie('CERTIFICADO'),
    ))

    expect(response.status).toBe(202)
    const body = await response.json() as { ok: boolean; receiptId: string }
    expect(body).toMatchObject({ ok: true })
    expect(body.receiptId).toMatch(/^[0-9a-f-]{36}$/)
    expectCookieContract(response, 'ciunac_notification_receipt', 900)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body))).toEqual({
      type: 'CERTIFICADO',
      email: 'verified@example.com',
      user: '1001',
    })
  })

  it('rejects an incompatible notification before calling the provider', async () => {
    const fetcher = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetcher)

    const response = await sendNotification(jsonRequest(
      '/api/security/notifications',
      { type: 'BECA', reference: '1001' },
      verifiedCookie('CERTIFICADO'),
    ))

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { code: 'FORBIDDEN' },
    })
    expect(fetcher).not.toHaveBeenCalled()
  })
})

describe('encrypted session cookie contracts', () => {
  it('rejects tampered, expired and wrong-purpose verified sessions', () => {
    const validCookie = verifiedCookie('CERTIFICADO')
    const [name, value] = validCookie.split('=')
    const tokenParts = value.split('.')
    tokenParts[2] = `${tokenParts[2].startsWith('A') ? 'B' : 'A'}${tokenParts[2].slice(1)}`
    const tamperedRequest = requestWithCookie('/protected', `${name}=${tokenParts.join('.')}`)
    expect(readVerifiedSessionFromRequest(tamperedRequest)).toBeNull()

    const expiredResponse = NextResponse.json({ ok: true })
    writeVerifiedSession(expiredResponse, 'verified@example.com', 'CERTIFICADO', 0)
    const expiredRequest = requestWithCookie(
      '/protected',
      cookieHeader(expiredResponse, 'ciunac_verified_session'),
    )
    expect(readVerifiedSessionFromRequest(expiredRequest)).toBeNull()

    const validRequest = requestWithCookie('/protected', validCookie)
    expect(readVerifiedSessionFromRequest(validRequest, 'BECA')).toBeNull()
    expect(readVerifiedSessionFromRequest(validRequest, 'CERTIFICADO')).not.toBeNull()
  })
})

function jsonRequest(path: string, body: unknown, cookie?: string) {
  const serialized = JSON.stringify(body)
  return new NextRequest(`http://localhost:3000${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': String(Buffer.byteLength(serialized)),
      Origin: 'http://localhost:3000',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: serialized,
  })
}

function requestWithCookie(path: string, cookie: string) {
  return new NextRequest(`http://localhost:3000${path}`, { headers: { Cookie: cookie } })
}

function verifiedCookie(purpose: 'CERTIFICADO' | 'BECA') {
  const response = NextResponse.json({ ok: true })
  writeVerifiedSession(response, 'verified@example.com', purpose)
  return cookieHeader(response, 'ciunac_verified_session')
}

function cookieHeader(response: NextResponse, name: string) {
  const cookie = response.cookies.get(name)
  if (!cookie) throw new Error(`Cookie ${name} was not created`)
  return `${cookie.name}=${cookie.value}`
}

function expectCookieContract(response: NextResponse, name: string, maxAge: number) {
  expect(response.cookies.get(name)).toMatchObject({
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge,
  })
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
    digital: true,
    observaciones: null,
    estudiante: {
      id: 'student-1',
      nombres: 'MARIA',
      apellidos: 'PEREZ',
      numeroDocumento: '77294050',
    },
    tiposSolicitud: { id: 1, solicitud: 'CERTIFICADO DE ESTUDIOS' },
    idioma: { id: 2, nombre: 'INGLES' },
    nivel: { id: 1, nombre: 'BASICO' },
    estado: { id: 1, nombre: 'NUEVO', referencia: '' },
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
