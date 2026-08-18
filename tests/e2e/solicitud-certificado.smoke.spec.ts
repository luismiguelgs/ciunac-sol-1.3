import { expect, Page, test } from '@playwright/test'
import {
  getMockRequests,
  getMockOtp,
  installBrowserMocks,
  resetMockApi,
  setMockScenario,
} from './support/browser-mocks'

async function selectOption(page: Page, label: string, option: RegExp) {
  await page.getByLabel(label, { exact: true }).click()
  await page.getByRole('option', { name: option }).click()
}

async function verifyCertificateEmail(page: Page, request: Parameters<typeof getMockOtp>[0]) {
  await page.goto('/solicitud-certificados')
  await expect(page.getByRole('heading', { name: 'Tarifario' })).toBeVisible()
  await expect(page.getByRole('cell', { name: /CERTIFICADO DE ESTUDIOS/i })).toBeVisible()
  await expect(page.locator('[data-e2e-recaptcha="ready"]')).toBeAttached()
  const otp = page.locator('input[data-input-otp]')
  const verifyButton = page.getByRole('button', { name: /Verificar c.digo y continuar/i })
  await expect(otp).toBeDisabled()
  await expect(verifyButton).toBeDisabled()
  await page.locator('input[name="email"]').fill('e2e@example.com')
  await page.getByRole('button', { name: /Comprobar correo y enviar c.digo/i }).click()
  await expect(page.getByText(/C.digo v.lido por 05:00.*solicitar otro en 03:00/i)).toBeVisible()

  await expect(otp).toBeEnabled()
  await expect(verifyButton).toBeEnabled()
  await otp.fill(await getMockOtp(request))
  await verifyButton.click()
  await expect(page).toHaveURL(/\/solicitud-certificados\/proceso$/)
}

type BasicDataOptions = { searchExisting?: boolean; unacStudent?: boolean }

async function completeCertificateBasicData(page: Page, options: BasicDataOptions = {}) {
  await selectOption(page, 'Solicitud', /CERTIFICADO DE ESTUDIOS/i)
  await selectOption(page, 'Programa', /INGLES/i)
  await selectOption(page, 'Nivel', /B.SICO/i)
  await page.locator('input[name="dni"]').fill('12345678')
  if (options.searchExisting) {
    await page.getByRole('button', { name: /Buscar Documento de Identidad/i }).click()
    await expect(page.locator('input[name="nombres"]')).toHaveValue('MARIA')
  } else {
    await page.locator('input[name="apellidos"]').fill('PRUEBA E2E')
    await page.locator('input[name="nombres"]').fill('MARIA')
    await page.locator('input[name="celular"]').fill('999888777')
  }
  if (options.unacStudent) {
    await page.getByRole('switch', { name: /Alumno UNAC/i }).click()
    await selectOption(page, 'Facultad', /INGENIERIA/i)
    await selectOption(page, 'Escuela', /INGENIERIA DE SISTEMAS/i)
    await page.locator('input[name="codigo"]').fill('20260001')
  }
  await page.getByRole('button', { name: 'Siguiente' }).click()
}

async function completeCertificateForm(page: Page, options: BasicDataOptions = {}) {
  await completeCertificateBasicData(page, options)
  await selectOption(page, 'Monto pagado', /S\/50\.00/i)
  await page.locator('input[name="numero_voucher"]').fill('123456789012345')
  await page.locator('input[type="file"]').setInputFiles({
    name: 'voucher.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'),
  })
  await expect(page.getByText(/Archivo cargado/i)).toBeVisible()
  await page.getByRole('button', { name: 'Siguiente' }).click()
  await page.getByRole('switch', { name: /Confirmo que los datos/i }).click()
  await page.getByRole('switch', { name: /Acepto los t/i }).click()
}

test.beforeEach(async ({ page, request }) => {
  await resetMockApi(request)
  await installBrowserMocks(page)
})

test('verifica el correo y entra al proceso de certificados', async ({ page, request }) => {
  const browserSentApiKeys: string[] = []
  page.on('request', (browserRequest) => {
    if (browserRequest.headers()['x-api-key']) browserSentApiKeys.push(browserRequest.url())
  })

  await verifyCertificateEmail(page, request)
  const requests = await getMockRequests(request)
  expect(requests).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ method: 'POST', path: '/mailer', hasApiKey: true }),
    ]),
  )
  expect(browserSentApiKeys).toEqual([])
})

test('@smoke registra una solicitud de certificado de extremo a extremo', async ({ page, request }) => {
  await verifyCertificateEmail(page, request)

  await selectOption(page, 'Solicitud', /CERTIFICADO DE ESTUDIOS/i)
  await selectOption(page, 'Programa', /INGLES/i)
  await selectOption(page, 'Nivel', /B.SICO/i)
  await page.locator('input[name="dni"]').fill('12345678')
  await page.locator('input[name="apellidos"]').fill('PRUEBA E2E')
  await page.locator('input[name="nombres"]').fill('MARIA')
  await page.locator('input[name="celular"]').fill('999888777')
  await page.getByRole('button', { name: 'Siguiente' }).click()

  await expect(page.getByLabel('Monto pagado', { exact: true })).toBeVisible()
  await selectOption(page, 'Monto pagado', /S\/50\.00/i)
  await page.locator('input[name="numero_voucher"]').fill('123456789012345')

  const upload = page.waitForResponse(
    (response) => response.url().endsWith('/api/ciunac/upload/vouchers') && response.request().method() === 'POST',
  )
  await page.locator('input[type="file"]').setInputFiles({
    name: 'voucher.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    ),
  })
  await upload
  await expect(page.getByText(/Archivo cargado/i)).toBeVisible()
  await page.getByRole('button', { name: 'Siguiente' }).click()

  await page.getByRole('switch', { name: /Confirmo que los datos/i }).click()
  await page.getByRole('switch', { name: /Acepto los t/i }).click()
  await page.getByRole('button', { name: 'Finalizar' }).click()

  await expect(page).toHaveURL(/\/solicitud-certificados\/finalizar\?id=1001&receipt=/)
  const downloadButton = page.getByRole('button', { name: /Descargar Cargo/i })
  await expect(downloadButton).toBeVisible()
  const downloadPromise = page.waitForEvent('download')
  await downloadButton.click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('CERTIFICADO-12345678-1001.pdf')

  const requests = await getMockRequests(request)
  expect(requests).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ method: 'POST', path: '/upload/vouchers' }),
      expect.objectContaining({ method: 'POST', path: '/estudiantes' }),
      expect.objectContaining({ method: 'POST', path: '/solicitudes' }),
      expect.objectContaining({ method: 'POST', path: '/mailer' }),
    ]),
  )
})

test('@smoke rechaza el acceso directo al proceso sin una sesion verificada', async ({ page }) => {
  await page.goto('/solicitud-certificados/proceso')

  await expect(page).toHaveURL(/\/solicitud-certificados$/)
  await expect(page.getByRole('heading', { name: /correo electr/i })).toBeVisible()
})

test('reintenta solo el correo cuando la solicitud ya fue guardada', async ({ page, request }) => {
  await verifyCertificateEmail(page, request)
  await setMockScenario(request, { mailFailuresRemaining: 1 })
  await completeCertificateForm(page)
  await page.getByRole('button', { name: 'Finalizar' }).click()

  await expect(page.getByText(/solicitud 1001 ya esta guardada/i)).toBeVisible()
  const beforeRetry = await getMockRequests(request)
  expect(beforeRetry.filter((item) => item.path === '/solicitudes')).toHaveLength(1)
  expect(beforeRetry.filter((item) => item.path === '/mailer' && (item.body as { type?: string })?.type === 'CERTIFICADO')).toHaveLength(1)

  await page.getByRole('button', { name: /Reintentar correo/i }).click()
  await expect(page).toHaveURL(/\/solicitud-certificados\/finalizar\?id=1001&receipt=/)
  await expect(page.getByText(/servicio acepto el correo/i)).toBeVisible()

  const afterRetry = await getMockRequests(request)
  expect(afterRetry.filter((item) => item.path === '/solicitudes')).toHaveLength(1)
  expect(afterRetry.filter((item) => item.path === '/mailer' && (item.body as { type?: string })?.type === 'CERTIFICADO')).toHaveLength(2)
})

test('detiene el correo cuando la API guarda sin devolver identificador', async ({ page, request }) => {
  await verifyCertificateEmail(page, request)
  await setMockScenario(request, { emptySolicitudResponse: true })
  await completeCertificateForm(page)
  await page.getByRole('button', { name: 'Finalizar' }).click()

  await expect(page.getByText(/no devolvio los datos esperados/i)).toBeVisible()
  const requests = await getMockRequests(request)
  expect(requests.filter((item) => item.path === '/solicitudes')).toHaveLength(1)
  expect(requests.filter((item) => item.path === '/mailer' && (item.body as { type?: string })?.type === 'CERTIFICADO')).toHaveLength(0)
})

test('no muestra exito de correo sin comprobante valido', async ({ page }) => {
  await page.goto('/solicitud-certificados/finalizar?id=1001')
  await expect(page.getByText(/No se pudo confirmar el estado del correo/i)).toBeVisible()
  await expect(page.getByText(/servicio acepto el correo/i)).toHaveCount(0)
})

test('actualiza un estudiante existente y envia alumno UNAC sin documento adicional', async ({ page, request }) => {
  await verifyCertificateEmail(page, request)
  await completeCertificateForm(page, { searchExisting: true, unacStudent: true })
  await page.getByRole('button', { name: 'Finalizar' }).click()
  await expect(page).toHaveURL(/\/solicitud-certificados\/finalizar\?id=1001&receipt=/)

  const requests = await getMockRequests(request)
  const studentUpdates = requests.filter((item) => item.method === 'PATCH' && item.path === '/estudiantes/student-e2e')
  const requestCreates = requests.filter((item) => item.method === 'POST' && item.path === '/solicitudes')
  expect(studentUpdates).toHaveLength(1)
  expect(studentUpdates[0].body).toMatchObject({ facultadId: 1, escuelaId: 1, codigo: '20260001' })
  expect(requestCreates).toHaveLength(1)
  expect(requestCreates[0].body).toMatchObject({ alumnoCiunac: true })
  expect(requestCreates[0].body).not.toHaveProperty('imgCertEstudio')
  expect(requests.filter((item) => item.method === 'POST' && item.path === '/estudiantes')).toHaveLength(0)
})

test('diferencia una respuesta de estudiante mal formada', async ({ page, request }) => {
  await verifyCertificateEmail(page, request)
  await setMockScenario(request, { malformedStudentLookup: true })
  await page.locator('input[name="dni"]').fill('12345678')
  await page.getByRole('button', { name: /Buscar Documento de Identidad/i }).click()
  await expect(page.getByText(/No se pudieron consultar los datos del estudiante/i)).toBeVisible()
})

test('rechaza un voucher falsificado antes de llamar al proveedor', async ({ page, request }) => {
  await verifyCertificateEmail(page, request)
  await completeCertificateBasicData(page)
  await selectOption(page, 'Monto pagado', /S\/50\.00/i)
  await page.locator('input[name="numero_voucher"]').fill('123456789012345')
  await page.locator('input[type="file"]').setInputFiles({
    name: 'voucher.png',
    mimeType: 'image/png',
    buffer: Buffer.from('archivo-falsificado'),
  })
  await expect(page.getByRole('alert').filter({ hasText: /archivo no es valido/i })).toBeVisible()

  const requests = await getMockRequests(request)
  expect(requests.filter((item) => item.path === '/upload/vouchers')).toHaveLength(0)
})

test('rechaza un monto manipulado sin crear la solicitud', async ({ page, request }) => {
  await verifyCertificateEmail(page, request)
  const response = await page.evaluate(async () => {
    const result = await fetch('/api/ciunac/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estudianteId: 'student-e2e', tipoSolicitudId: 1, idiomaId: 2, nivelId: 1,
        estadoId: 1, periodo: '202602', alumnoCiunac: false,
        fechaPago: '2026-08-01T00:00:00.000Z', pago: 1, digital: false,
        numeroVoucher: '123456789012345', imgVoucher: '/images/upload.svg',
      }),
    })
    return { status: result.status, body: await result.json() }
  })
  expect(response).toMatchObject({ status: 409, body: { error: { code: 'PRICE_CHANGED' } } })
  const requests = await getMockRequests(request)
  expect(requests.filter((item) => item.path === '/solicitudes')).toHaveLength(0)
})

test('ignora trabajador y antiguo y ofrece solo el precio normal', async ({ page, request }) => {
  await verifyCertificateEmail(page, request)
  await page.goto('/solicitud-certificados/proceso?trabajador=true&antiguo=true')
  await completeCertificateBasicData(page)
  await page.getByLabel('Monto pagado', { exact: true }).click()
  await expect(page.getByRole('option', { name: /precio normal/i })).toHaveCount(1)
  await expect(page.getByText(/descuento.*trabajador/i)).toHaveCount(0)
})

test('detiene el correo ante una respuesta de solicitud mal formada', async ({ page, request }) => {
  await verifyCertificateEmail(page, request)
  await setMockScenario(request, { malformedSolicitudResponse: true })
  await completeCertificateForm(page)
  await page.getByRole('button', { name: 'Finalizar' }).click()
  await expect(page.getByText(/identificador de la solicitud/i)).toBeVisible()

  const requests = await getMockRequests(request)
  expect(requests.filter((item) => item.path === '/solicitudes')).toHaveLength(1)
  expect(requests.filter((item) => item.path === '/mailer' && (item.body as { type?: string })?.type === 'CERTIFICADO')).toHaveLength(0)
})

test('muestra indisponibilidad cuando los catalogos son invalidos', async ({ page, request }) => {
  await verifyCertificateEmail(page, request)
  await setMockScenario(request, { malformedCertificateCatalogs: true })
  await page.reload()
  await expect(page.getByRole('heading', { name: /No se pudo abrir la solicitud de certificado/i })).toBeVisible()
})

test('diferencia cargo inexistente y cargo mal formado con reintento', async ({ page, request }) => {
  await verifyCertificateEmail(page, request)
  await setMockScenario(request, { certificateCargoNotFound: true })
  await page.goto('/solicitud-certificados/finalizar?id=1001')
  await expect(page.getByText(/Cargo aun no disponible/i)).toBeVisible()

  await setMockScenario(request, { certificateCargoNotFound: false, malformedCertificateCargo: true })
  await page.reload()
  await expect(page.getByText(/No se pudo cargar el cargo/i)).toBeVisible()
  await setMockScenario(request, { malformedCertificateCargo: false })
  await page.getByRole('button', { name: /Reintentar carga/i }).click()
  await expect(page.getByRole('button', { name: /Descargar Cargo/i })).toBeEnabled()
})

test('rechaza un identificador final invalido', async ({ page }) => {
  await page.goto('/solicitud-certificados/finalizar?id=abc')
  await expect(page.getByRole('heading', { name: /Solicitud de certificado no identificada/i })).toBeVisible()
})
