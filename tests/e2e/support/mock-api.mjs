import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const host = '127.0.0.1'
const port = 4100
const fixtureUrl = new URL('../fixtures/api-data.json', import.meta.url)
const fixture = JSON.parse(readFileSync(fileURLToPath(fixtureUrl), 'utf8'))
let requests = []
let scenario = {}
let documentRequestReads = 0

function corsHeaders() {
  return {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Origin': 'http://127.0.0.1:3100',
  }
}

function sendJson(response, status, data) {
  response.writeHead(status, {
    ...corsHeaders(),
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(data))
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = []
    request.on('data', (chunk) => chunks.push(chunk))
    request.on('end', () => resolve(Buffer.concat(chunks)))
    request.on('error', reject)
  })
}

function parseBody(buffer, contentType) {
  if (buffer.length === 0) return null
  if (contentType.includes('application/json')) {
    return JSON.parse(buffer.toString('utf8'))
  }
  if (contentType.includes('multipart/form-data')) {
    return { multipart: true, bytes: buffer.length }
  }
  return buffer.toString('utf8')
}

function findSolicitud(id) {
  return fixture.solicitudes.find((item) => String(item.id) === String(id)) ?? fixture.solicitudes[0]
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${host}:${port}`)
  const path = url.pathname.replace(/^\/+|\/+$/g, '')
  const method = request.method ?? 'GET'

  if (method === 'OPTIONS') {
    response.writeHead(204, corsHeaders())
    response.end()
    return
  }

  if (path === '__test/health') {
    sendJson(response, 200, { ok: true })
    return
  }

  if (path === '__test/reset' && method === 'POST') {
    requests = []
    scenario = {}
    documentRequestReads = 0
    sendJson(response, 200, { ok: true })
    return
  }

  if (path === '__test/scenario' && method === 'POST') {
    const rawScenario = await readBody(request)
    scenario = { ...scenario, ...JSON.parse(rawScenario.toString('utf8')) }
    sendJson(response, 200, { ok: true })
    return
  }

  if (path === '__test/requests') {
    sendJson(response, 200, requests)
    return
  }

  if (path === '__test/otp') {
    const otpRequest = requests.findLast((item) => item.path === '/mailer' && item.body?.type === 'RANDOM')
    sendJson(response, otpRequest ? 200 : 404, { code: otpRequest?.body?.number ?? null })
    return
  }

  if (path === '__test/q10-programs') {
    if (scenario.q10ProgramsError) return sendJson(response, 503, { internal: 'hidden Q10 catalog failure' })
    if (scenario.emptyQ10Programs) return sendJson(response, 200, [])
    if (scenario.malformedQ10Programs) return sendJson(response, 200, [{ Codigo: 'INVALID' }])
    return sendJson(response, 200, fixture.q10Programs)
  }

  const rawBody = await readBody(request)
  const contentType = request.headers['content-type'] ?? ''
  let body = null

  try {
    body = parseBody(rawBody, contentType)
  } catch {
    body = { parseError: true, raw: rawBody.toString('utf8') }
  }

  requests.push({
    method,
    path: `/${path}`,
    body,
    hasApiKey: typeof request.headers['x-api-key'] === 'string',
  })

  if (method === 'GET' && path === 'tipossolicitud') {
    if (scenario.locationCatalogError) return sendJson(response, 503, { internal: 'hidden location catalog failure' })
    if (scenario.emptyLocationCatalogs) return sendJson(response, 200, fixture.tiposSolicitud.filter((item) => item.id !== 7))
    if (scenario.malformedLocationCatalogs) {
      return sendJson(response, 200, fixture.tiposSolicitud.map((item) => item.id === 7 ? { id: 7, solicitud: '' } : item))
    }
    if (scenario.locationPriceMismatch) {
      return sendJson(response, 200, fixture.tiposSolicitud.map((item) => item.id === 7 ? { ...item, precio: 80 } : item))
    }
    if (scenario.certificateCatalogError) return sendJson(response, 503, { internal: 'hidden certificate catalog failure' })
    if (scenario.emptyCertificateCatalogs) return sendJson(response, 200, [])
    if (scenario.malformedCertificateCatalogs) return sendJson(response, 200, [{ id: 1, solicitud: '' }])
    return sendJson(response, 200, fixture.tiposSolicitud)
  }
  if (method === 'GET' && path === 'idiomas') {
    if (scenario.certificateCatalogError) return sendJson(response, 503, { internal: 'hidden certificate catalog failure' })
    if (scenario.emptyCertificateCatalogs) return sendJson(response, 200, [])
    if (scenario.malformedCertificateCatalogs) return sendJson(response, 200, [{ id: 2 }])
    return sendJson(response, 200, fixture.idiomas)
  }
  if (method === 'GET' && path === 'facultades') {
    if (scenario.scholarshipCatalogError) return sendJson(response, 503, { internal: 'hidden catalog failure' })
    if (scenario.emptyScholarshipCatalogs) return sendJson(response, 200, [])
    if (scenario.malformedScholarshipCatalogs) return sendJson(response, 200, [{ nombre: 'Incompleta' }])
    return sendJson(response, 200, fixture.facultades)
  }
  if (method === 'GET' && path === 'escuelas') {
    if (scenario.scholarshipCatalogError) return sendJson(response, 503, { internal: 'hidden catalog failure' })
    if (scenario.emptyScholarshipCatalogs) return sendJson(response, 200, [])
    if (scenario.malformedScholarshipCatalogs) return sendJson(response, 200, [{ id: 1 }])
    return sendJson(response, 200, fixture.escuelas)
  }
  if (method === 'GET' && path === 'textos') {
    if (scenario.textsError) return sendJson(response, 503, { internal: 'hidden text provider failure' })
    if (scenario.emptyCertificateCatalogs) return sendJson(response, 200, [])
    if (scenario.malformedCertificateCatalogs) return sendJson(response, 200, [{ codigo: 'TEXTO_NOMBREAN' }])
    return sendJson(response, 200, fixture.textos)
  }
  if (method === 'GET' && path === 'ciclos') {
    if (scenario.locationMissingCycle) return sendJson(response, 200, [])
    return sendJson(response, 200, fixture.ciclos)
  }
  if (method === 'GET' && path === 'salones') return sendJson(response, 200, [])
  if (method === 'GET' && path === 'cronogramaubicacion') return sendJson(response, 200, fixture.cronogramas)
  if (method === 'GET' && path === 'examenesubicacion') {
    if (scenario.locationMissingExam) return sendJson(response, 200, [])
    return sendJson(response, 200, fixture.examenes)
  }
  if (method === 'GET' && path.startsWith('detallesubicacion/estudiante/documento/')) {
    if (scenario.locationDetailsError) return sendJson(response, 503, { internal: 'hidden provider failure' })
    if (scenario.emptyLocationDetails) return sendJson(response, 200, [])
    if (scenario.malformedLocationDetails) return sendJson(response, 200, [{ id: 601 }])
    if (scenario.foreignLocationDetails) {
      return sendJson(response, 200, fixture.detallesUbicacion.map((item) => ({
        ...item,
        estudiante: { ...fixture.estudiante, numeroDocumento: '87654321' },
      })))
    }
    return sendJson(response, 200, fixture.detallesUbicacion)
  }

  if (method === 'GET' && path.startsWith('estudiantes/buscar/')) {
    if (scenario.studentLookupError) return sendJson(response, 503, { internal: 'hidden student lookup failure' })
    if (scenario.studentNotFound) return sendJson(response, 404, { error: 'not found' })
    if (scenario.malformedStudentLookup) return sendJson(response, 200, { id: 'student-e2e' })
    return sendJson(response, 200, fixture.estudiante)
  }
  if (method === 'POST' && path === 'estudiantes') {
    if (scenario.emptyStudentResponse) {
      response.writeHead(204, corsHeaders())
      response.end()
      return
    }
    if (scenario.malformedStudentResponse) return sendJson(response, 201, {})
    return sendJson(response, 201, fixture.estudiante)
  }
  if (method === 'PATCH' && path.startsWith('estudiantes/')) {
    if (scenario.malformedStudentResponse) return sendJson(response, 200, {})
    return sendJson(response, 200, fixture.estudiante)
  }

  if (method === 'GET' && path.startsWith('solicitudes/documento/')) {
    documentRequestReads += 1
    if (scenario.emptyRequestsAfterFirst && documentRequestReads > 1) return sendJson(response, 200, [])
    if (scenario.malformedRequestsAfterFirst && documentRequestReads > 1) return sendJson(response, 200, [{ id: 1001 }])
    let requestsResponse = scenario.readyDigitalCertificate
      ? fixture.solicitudes.map((item) => item.id === 1001
        ? { ...item, estadoId: 3, digital: true, estado: { id: 3, nombre: 'PARA RECOGER', referencia: 'LISTO' } }
        : item)
      : fixture.solicitudes
    if (scenario.duplicateLocationRequest) {
      requestsResponse = requestsResponse.map((item) => item.id === 1002
        ? { ...item, estadoId: 1, estado: { id: 1, nombre: 'NUEVO', referencia: 'REGISTRADO' } }
        : item)
    }
    return sendJson(response, 200, requestsResponse)
  }
  if (method === 'POST' && path === 'solicitudes') {
    if (scenario.emptySolicitudResponse) {
      response.writeHead(204, corsHeaders())
      response.end()
      return
    }
    if (scenario.malformedSolicitudResponse) return sendJson(response, 201, {})
    const requestTypeId = Number(body?.tipoSolicitudId)
    const requestId = requestTypeId === 7 ? '1002' : [5, 6].includes(requestTypeId) ? '1003' : '1001'
    return sendJson(response, 201, { id: requestId })
  }
  if (method === 'GET' && /^solicitudes\/\d+$/.test(path)) {
    if (scenario.certificateCargoError) return sendJson(response, 503, { internal: 'hidden cargo failure' })
    if (scenario.certificateCargoNotFound) return sendJson(response, 404, { error: 'not found' })
    if (scenario.malformedCertificateCargo) return sendJson(response, 200, { id: Number(path.split('/')[1]) })
    return sendJson(response, 200, findSolicitud(path.split('/')[1]))
  }
  if (method === 'POST' && path === 'solicitudbecas') {
    if (scenario.scholarshipError) return sendJson(response, 503, { internal: 'hidden scholarship failure' })
    if (scenario.emptyScholarshipResponse) {
      response.writeHead(204, corsHeaders())
      response.end()
      return
    }
    if (scenario.malformedScholarshipResponse) return sendJson(response, 201, {})
    return sendJson(response, 201, { _id: 'BECA-E2E' })
  }

  if (method === 'GET' && path.startsWith('certificados/solicitud/')) {
    return sendJson(response, 200, fixture.certificado)
  }
  if (method === 'GET' && path.startsWith('certificados/')) {
    if (scenario.certificateNotFound) return sendJson(response, 404, { error: 'not found' })
    if (scenario.emptyCertificateResponse) {
      response.writeHead(204, corsHeaders())
      response.end()
      return
    }
    if (scenario.malformedCertificate) return sendJson(response, 200, { _id: fixture.certificado._id, notas: [] })
    if (scenario.certificateOwnerMismatch) {
      return sendJson(response, 200, { ...fixture.certificado, numeroDocumento: '87654321' })
    }
    if (scenario.certificateWithoutNotes) return sendJson(response, 200, { ...fixture.certificado, notas: [] })
    return sendJson(response, 200, fixture.certificado)
  }
  if (method === 'PATCH' && path.startsWith('certificados/')) {
    return sendJson(response, 200, fixture.certificado)
  }

  if (method === 'GET' && path.startsWith('constancias/solicitud/')) {
    return sendJson(response, 200, fixture.constancia)
  }
  if (method === 'PATCH' && path.startsWith('constancias/')) {
    return sendJson(response, 200, fixture.constancia)
  }

  if (method === 'POST' && path === 'mailer') {
    if (body?.type !== 'RANDOM' && Number(scenario.mailFailuresRemaining ?? 0) > 0) {
      scenario.mailFailuresRemaining = Number(scenario.mailFailuresRemaining) - 1
      return sendJson(response, 503, { internal: 'hidden mail failure' })
    }
    return sendJson(response, 200, { ok: true })
  }
  if (method === 'POST' && path.startsWith('upload/')) {
    const folder = path.split('/')[1]
    return sendJson(response, 201, {
      id: 'upload-e2e',
      name: 'fixture.png',
      folder,
      viewLink: '/images/upload.svg',
      downloadLink: '/images/upload.svg',
    })
  }
  if (method === 'POST' && path === 'q10/estudiantes') {
    if (scenario.q10RegistrationError) return sendJson(response, 503, { internal: 'hidden Q10 registration failure' })
    if (scenario.emptyQ10RegistrationResponse) {
      response.writeHead(204, corsHeaders())
      response.end()
      return
    }
    if (scenario.malformedQ10RegistrationResponse) return sendJson(response, 201, ['invalid'])
    return sendJson(response, 201, fixture.estudiante)
  }

  sendJson(response, 404, { error: `No E2E mock for ${method} /${path}` })
})

server.listen(port, host, () => {
  process.stdout.write(`CIUNAC E2E mock API listening at http://${host}:${port}\n`)
})

function closeServer() {
  server.close(() => process.exit(0))
}

process.on('SIGINT', closeServer)
process.on('SIGTERM', closeServer)
