import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const host = '127.0.0.1'
const port = 4100
const fixtureUrl = new URL('../fixtures/api-data.json', import.meta.url)
const fixture = JSON.parse(readFileSync(fileURLToPath(fixtureUrl), 'utf8'))
let requests = []

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

  if (method === 'GET' && path === 'tipossolicitud') return sendJson(response, 200, fixture.tiposSolicitud)
  if (method === 'GET' && path === 'idiomas') return sendJson(response, 200, fixture.idiomas)
  if (method === 'GET' && path === 'facultades') return sendJson(response, 200, fixture.facultades)
  if (method === 'GET' && path === 'escuelas') return sendJson(response, 200, fixture.escuelas)
  if (method === 'GET' && path === 'textos') return sendJson(response, 200, fixture.textos)
  if (method === 'GET' && path === 'ciclos') return sendJson(response, 200, fixture.ciclos)
  if (method === 'GET' && path === 'salones') return sendJson(response, 200, [])
  if (method === 'GET' && path === 'cronogramaubicacion') return sendJson(response, 200, fixture.cronogramas)
  if (method === 'GET' && path === 'examenesubicacion') return sendJson(response, 200, fixture.examenes)
  if (method === 'GET' && path.startsWith('detallesubicacion/estudiante/documento/')) {
    return sendJson(response, 200, fixture.detallesUbicacion)
  }

  if (method === 'GET' && path.startsWith('estudiantes/buscar/')) {
    return sendJson(response, 200, fixture.estudiante)
  }
  if (method === 'POST' && path === 'estudiantes') {
    return sendJson(response, 201, fixture.estudiante)
  }
  if (method === 'PATCH' && path.startsWith('estudiantes/')) {
    return sendJson(response, 200, fixture.estudiante)
  }

  if (method === 'GET' && path.startsWith('solicitudes/documento/')) {
    return sendJson(response, 200, fixture.solicitudes)
  }
  if (method === 'POST' && path === 'solicitudes') {
    return sendJson(response, 201, { id: '1001' })
  }
  if (method === 'GET' && /^solicitudes\/\d+$/.test(path)) {
    return sendJson(response, 200, findSolicitud(path.split('/')[1]))
  }
  if (method === 'POST' && path === 'solicitudbecas') {
    return sendJson(response, 201, { _id: 'BECA-E2E' })
  }

  if (method === 'GET' && path.startsWith('certificados/solicitud/')) {
    return sendJson(response, 200, fixture.certificado)
  }
  if (method === 'GET' && path.startsWith('certificados/')) {
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
