import { expect, Page, test } from '@playwright/test'
import {
  getMockOtp,
  getMockRequests,
  installBrowserMocks,
  resetMockApi,
  setMockScenario,
} from './support/browser-mocks'

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)
const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF')

async function selectOption(page: Page, label: string, option: RegExp) {
  await page.getByLabel(label, { exact: true }).click()
  await page.getByRole('option', { name: option }).click()
}

async function verifyLocationEmail(page: Page, isCiunacStudent = false) {
  await page.goto('/solicitud-ubicacion')
  await expect(page.getByRole('cell', { name: /S\/\s*30\.00/i })).toBeVisible()
  await expect(page.getByRole('cell', { name: /EXAMEN DE UBICACION/i })).toBeVisible()
  await expect(page.locator('[data-e2e-recaptcha="ready"]')).toBeAttached()
  await page.locator('input[name="email"]').fill('e2e@example.com')
  await page.getByRole('button', { name: /Comprobar correo y enviar c.digo/i }).click()
  await expect(page.getByText(/C.digo v.lido por 05:00.*solicitar otro en 03:00/i)).toBeVisible()
  await page.locator('input[data-input-otp]').fill(await getMockOtp(page.request))
  await page.getByRole('button', { name: /Verificar c.digo y continuar/i }).click()
  await expect(page.getByRole('heading', { name: /Verificacion de informacion adicional/i })).toBeVisible()
  if (isCiunacStudent) {
    await page.getByRole('switch', { name: /Alumno CIUNAC/i }).click()
  }
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page).toHaveURL(/\/solicitud-ubicacion\/proceso$/)
}

async function completeBasicData(page: Page, isCiunacStudent = false) {
  await selectOption(page, 'Programa', /INGLES/i)
  if (isCiunacStudent) await selectOption(page, 'Nivel', /INTERMEDIO/i)
  await page.locator('input[name="dni"]').fill('12345678')
  await page.locator('input[name="apellidos"]').fill('PRUEBA E2E')
  await page.locator('input[name="nombres"]').fill('MARIA')
  await page.locator('input[name="celular"]').fill('999888777')
  await page.locator('input[type="file"]').setInputFiles({
    name: 'dni.png',
    mimeType: 'image/png',
    buffer: png,
  })
  await expect(page.getByText(/Archivo cargado/i)).toBeVisible()
  await page.getByRole('button', { name: 'Siguiente' }).click()
}

async function completePayment(page: Page) {
  await selectOption(page, 'Monto pagado', /S\/30\.00/i)
  await page.locator('input[name="numero_voucher"]').fill('123456789012345')
  await page.locator('input[type="file"]').setInputFiles({
    name: 'voucher.png',
    mimeType: 'image/png',
    buffer: png,
  })
  await expect(page.getByText(/Archivo cargado/i)).toBeVisible()
  await page.getByRole('button', { name: 'Siguiente' }).click()
}

async function completeStudyCertificate(page: Page) {
  await page.locator('input[type="file"]').setInputFiles({
    name: 'certificado.pdf',
    mimeType: 'application/pdf',
    buffer: pdf,
  })
  await expect(page.getByText(/Archivo cargado/i)).toBeVisible()
  await page.getByRole('button', { name: 'Siguiente' }).click()
}

async function confirmAndSubmit(page: Page) {
  await page.getByRole('switch', { name: /Confirmo que los datos/i }).click()
  await page.getByRole('switch', { name: /Acepto los t/i }).click()
  await page.getByRole('button', { name: 'Finalizar' }).click()
}

async function completeLocationForm(page: Page, isCiunacStudent = false) {
  await completeBasicData(page, isCiunacStudent)
  await completePayment(page)
  if (isCiunacStudent) await completeStudyCertificate(page)
}

test.beforeEach(async ({ page, request }) => {
  await resetMockApi(request)
  await installBrowserMocks(page)
})

test('@smoke registra el examen de ubicacion no CIUNAC con tarifa S/ 30', async ({ page, request }) => {
  await verifyLocationEmail(page)
  await completeLocationForm(page)
  await confirmAndSubmit(page)

  await expect(page).toHaveURL(/\/solicitud-ubicacion\/finalizar\?id=1002&receipt=/)
  const downloadButton = page.getByRole('button', { name: /Descargar cargo/i })
  await expect(downloadButton).toBeEnabled()
  const downloadPromise = page.waitForEvent('download')
  await downloadButton.click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('UBICACION-12345678-1002.pdf')
  const requests = await getMockRequests(request)
  const created = requests.find((item) => item.method === 'POST' && item.path === '/solicitudes')
  expect(created?.body).toMatchObject({
    tipoSolicitudId: 7,
    alumnoCiunac: false,
    pago: 30,
    digital: false,
  })
  expect(created?.body).toHaveProperty('imgVoucher')
  expect(created?.body).not.toHaveProperty('imgCertEstudio')
  expect(requests.filter((item) => item.path === '/upload/dnis')).toHaveLength(1)
  expect(requests.filter((item) => item.path === '/upload/vouchers')).toHaveLength(1)
})

test('registra un alumno CIUNAC con certificado PDF y nivel seleccionado', async ({ page, request }) => {
  await verifyLocationEmail(page, true)
  await completeLocationForm(page, true)
  await confirmAndSubmit(page)

  await expect(page).toHaveURL(/\/solicitud-ubicacion\/finalizar\?id=1002&receipt=/)
  const requests = await getMockRequests(request)
  const created = requests.find((item) => item.method === 'POST' && item.path === '/solicitudes')
  expect(created?.body).toMatchObject({
    tipoSolicitudId: 7,
    alumnoCiunac: true,
    nivelId: 2,
    pago: 30,
    imgCertEstudio: '/images/upload.svg',
  })
  expect(requests.filter((item) => item.path === '/upload/becas')).toHaveLength(1)
})

test('@smoke rechaza acceso directo al proceso sin sesion y perfil verificados', async ({ page }) => {
  await page.goto('/solicitud-ubicacion/proceso')
  await expect(page).toHaveURL(/\/solicitud-ubicacion$/)
  await expect(page.getByRole('heading', { name: /correo electronico/i })).toBeVisible()
})

test('bloquea un tarifario distinto de S/ 30', async ({ page, request }) => {
  await setMockScenario(request, { locationPriceMismatch: true })
  await page.goto('/solicitud-ubicacion')
  await expect(page.getByRole('heading', { name: /No se pudo abrir la solicitud de ubicacion/i })).toBeVisible()
})

test('rechaza un monto manipulado sin crear la solicitud', async ({ page, request }) => {
  await verifyLocationEmail(page)
  const response = await page.evaluate(async () => {
    const result = await fetch('/api/ciunac/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentNumber: '12345678',
        request: {
          estudianteId: 'student-e2e', tipoSolicitudId: 7, idiomaId: 2, nivelId: 1,
          estadoId: 1, periodo: '202602', alumnoCiunac: false,
          fechaPago: '2026-08-01T00:00:00.000Z', pago: 80, digital: false,
          numeroVoucher: '123456789012345', imgVoucher: '/images/upload.svg',
        },
      }),
    })
    return { status: result.status, body: await result.json() }
  })
  expect(response).toMatchObject({ status: 409, body: { error: { code: 'PRICE_CHANGED' } } })
  const requests = await getMockRequests(request)
  expect(requests.filter((item) => item.path === '/solicitudes')).toHaveLength(0)
})

test('detecta una solicitud de ubicacion duplicada antes del pago', async ({ page, request }) => {
  await verifyLocationEmail(page)
  await setMockScenario(request, { duplicateLocationRequest: true })
  await completeBasicData(page)
  await expect(page.getByRole('heading', { name: /Solicitud en proceso/i })).toBeVisible()
  await expect(page.getByLabel('Monto pagado', { exact: true })).toHaveCount(0)
})

test('rechaza documento de identidad y certificado con firma falsa', async ({ page, request }) => {
  await verifyLocationEmail(page, true)
  await selectOption(page, 'Programa', /INGLES/i)
  await selectOption(page, 'Nivel', /INTERMEDIO/i)
  await page.locator('input[name="dni"]').fill('12345678')
  await page.locator('input[type="file"]').setInputFiles({
    name: 'dni.png', mimeType: 'image/png', buffer: Buffer.from('not-a-png'),
  })
  await expect(page.getByRole('alert').filter({ hasText: /archivo no es valido/i })).toBeVisible()

  let requests = await getMockRequests(request)
  expect(requests.filter((item) => item.path === '/upload/dnis')).toHaveLength(0)

  await page.locator('input[name="apellidos"]').fill('PRUEBA E2E')
  await page.locator('input[name="nombres"]').fill('MARIA')
  await page.locator('input[name="celular"]').fill('999888777')
  await page.locator('input[type="file"]').setInputFiles({
    name: 'dni.png', mimeType: 'image/png', buffer: png,
  })
  await expect(page.getByText(/Archivo cargado/i)).toBeVisible()
  await page.getByRole('button', { name: 'Siguiente' }).click()
  await completePayment(page)
  await page.locator('input[type="file"]').setInputFiles({
    name: 'certificado.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not-a-pdf'),
  })
  await expect(page.getByRole('alert').filter({ hasText: /archivo no es valido/i })).toBeVisible()
  requests = await getMockRequests(request)
  expect(requests.filter((item) => item.path === '/upload/becas')).toHaveLength(0)
})

test('rechaza un perfil CIUNAC distinto del perfil verificado', async ({ page, request }) => {
  await verifyLocationEmail(page)
  const response = await page.evaluate(async () => {
    const result = await fetch('/api/ciunac/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentNumber: '12345678',
        request: {
          estudianteId: 'student-e2e', tipoSolicitudId: 7, idiomaId: 2, nivelId: 2,
          estadoId: 1, periodo: '202602', alumnoCiunac: true,
          fechaPago: '2026-08-01T00:00:00.000Z', pago: 30, digital: false,
          numeroVoucher: '123456789012345', imgVoucher: '/images/upload.svg',
          imgCertEstudio: '/images/upload.svg',
        },
      }),
    })
    return { status: result.status, body: await result.json() }
  })
  expect(response).toMatchObject({ status: 403, body: { error: { code: 'FORBIDDEN' } } })
  const requests = await getMockRequests(request)
  expect(requests.filter((item) => item.path === '/solicitudes')).toHaveLength(0)
})

test('reintenta solo el correo cuando la solicitud ya fue guardada', async ({ page, request }) => {
  await verifyLocationEmail(page)
  await setMockScenario(request, { mailFailuresRemaining: 1 })
  await completeLocationForm(page)
  await confirmAndSubmit(page)

  await expect(page.getByText(/solicitud 1002 ya esta guardada/i)).toBeVisible()
  let requests = await getMockRequests(request)
  expect(requests.filter((item) => item.path === '/solicitudes')).toHaveLength(1)
  expect(requests.filter((item) => item.path === '/mailer' && (item.body as { type?: string })?.type === 'UBICACION')).toHaveLength(1)

  await page.getByRole('button', { name: /Reintentar correo/i }).click()
  await expect(page).toHaveURL(/\/solicitud-ubicacion\/finalizar\?id=1002&receipt=/)
  requests = await getMockRequests(request)
  expect(requests.filter((item) => item.path === '/solicitudes')).toHaveLength(1)
  expect(requests.filter((item) => item.path === '/mailer' && (item.body as { type?: string })?.type === 'UBICACION')).toHaveLength(2)
})

test('detiene el correo ante una respuesta de solicitud sin identificador', async ({ page, request }) => {
  await verifyLocationEmail(page)
  await setMockScenario(request, { malformedSolicitudResponse: true })
  await completeLocationForm(page)
  await confirmAndSubmit(page)

  await expect(page.getByText(/identificador de la solicitud/i)).toBeVisible()
  const requests = await getMockRequests(request)
  expect(requests.filter((item) => item.path === '/solicitudes')).toHaveLength(1)
  expect(requests.filter((item) => item.path === '/mailer' && (item.body as { type?: string })?.type === 'UBICACION')).toHaveLength(0)
})

test('diferencia cargo inexistente, error tecnico e identificador invalido', async ({ page, request }) => {
  await verifyLocationEmail(page)
  await setMockScenario(request, { certificateCargoNotFound: true })
  await page.goto('/solicitud-ubicacion/finalizar?id=1002')
  await expect(page.getByText(/Cargo aun no disponible/i)).toBeVisible()

  await setMockScenario(request, { certificateCargoNotFound: false, malformedCertificateCargo: true })
  await page.reload()
  await expect(page.getByText(/No se pudo cargar el cargo/i)).toBeVisible()

  await page.goto('/solicitud-ubicacion/finalizar?id=abc')
  await expect(page.getByRole('heading', { name: /Solicitud de ubicacion no identificada/i })).toBeVisible()
})
