import { expect, Page, test } from '@playwright/test'
import {
  getMockOtp,
  getMockRequests,
  installBrowserMocks,
  resetMockApi,
  setMockScenario,
} from './support/browser-mocks'

async function selectOption(page: Page, label: string, option: RegExp) {
  await page.getByLabel(label, { exact: true }).click()
  await page.getByRole('option', { name: option }).click()
}

async function verifyConstanciaEmail(page: Page, request: Parameters<typeof getMockOtp>[0]) {
  await page.goto('/solicitud-constancias')
  await expect(page.getByRole('heading', { name: 'Tarifario' })).toBeVisible()
  await expect(page.getByRole('cell', { name: /CONSTANCIA DE ESTUDIOS/i })).toBeVisible()
  await expect(page.locator('[data-e2e-recaptcha="ready"]')).toBeAttached()
  const otp = page.locator('input[data-input-otp]')
  const verifyButton = page.getByRole('button', { name: /Verificar c.digo y continuar/i })
  await expect(otp).toBeDisabled()
  await expect(verifyButton).toBeDisabled()
  await page.locator('input[name="email"]').fill('e2e@example.com')
  await page.getByRole('button', { name: /Comprobar correo y enviar c.digo/i }).click()
  await expect(page.getByText(/C.digo enviado/i)).toBeVisible()
  await expect(otp).toBeEnabled()
  await expect(verifyButton).toBeEnabled()
  await otp.fill(await getMockOtp(request))
  await verifyButton.click()
  await expect(page).toHaveURL(/\/solicitud-constancias\/proceso$/)
}

async function completeConstanciaBasicData(page: Page) {
  await selectOption(page, 'Solicitud', /CONSTANCIA DE ESTUDIOS/i)
  await selectOption(page, 'Programa', /INGLES/i)
  await selectOption(page, 'Nivel', /B.SICO/i)
  await page.locator('input[name="dni"]').fill('12345678')
  await page.locator('input[name="apellidos"]').fill('PRUEBA E2E')
  await page.locator('input[name="nombres"]').fill('MARIA')
  await page.locator('input[name="celular"]').fill('999888777')
  await page.getByRole('button', { name: 'Siguiente' }).click()
}

async function completeConstanciaForm(page: Page) {
  await completeConstanciaBasicData(page)
  await selectOption(page, 'Monto pagado', /S\/30\.00/i)
  await page.locator('input[name="numero_voucher"]').fill('123456789012345')
  await page.locator('input[type="file"]').setInputFiles({
    name: 'voucher.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'),
  })
  await expect(page.getByText(/Archivo cargado/i)).toBeVisible()
  await page.getByRole('button', { name: 'Siguiente' }).click()
  await page.getByRole('switch', { name: /Confirmo que los datos/i }).click()
  await page.getByRole('switch', { name: /Acepto los terminos/i }).click()
}

test.beforeEach(async ({ page, request }) => {
  await resetMockApi(request)
  await installBrowserMocks(page)
})

test('registra constancia como slice independiente con pago compartido', async ({ page, request }) => {
  await verifyConstanciaEmail(page, request)
  await completeConstanciaForm(page)
  await page.getByRole('button', { name: 'Finalizar' }).click()

  await expect(page).toHaveURL(/\/solicitud-constancias\/finalizar\?id=1003&receipt=/)
  const downloadButton = page.getByRole('button', { name: /Descargar cargo/i })
  await expect(downloadButton).toBeVisible()
  await expect(page.getByText(/servicio acepto el correo/i)).toBeVisible()

  const downloadPromise = page.waitForEvent('download')
  await downloadButton.click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^CONSTANCIA-.*\.pdf$/)

  const requests = await getMockRequests(request)
  const solicitudRequest = requests.find((item) => item.path === '/solicitudes')
  expect(solicitudRequest?.body).toMatchObject({
    tipoSolicitudId: 5,
    pago: 30,
    numeroVoucher: '123456789012345',
    imgVoucher: '/images/upload.svg',
    digital: true,
  })
  expect(requests).toEqual(expect.arrayContaining([
    expect.objectContaining({ method: 'POST', path: '/upload/vouchers' }),
    expect.objectContaining({ method: 'POST', path: '/estudiantes' }),
    expect.objectContaining({ method: 'POST', path: '/solicitudes' }),
    expect.objectContaining({ method: 'POST', path: '/mailer' }),
  ]))
})

test('rechaza acceso directo al proceso de constancias sin sesion', async ({ page }) => {
  await page.goto('/solicitud-constancias/proceso')
  await expect(page).toHaveURL(/\/solicitud-constancias$/)
})

test('rechaza un voucher con firma binaria falsificada', async ({ page, request }) => {
  await verifyConstanciaEmail(page, request)
  await completeConstanciaBasicData(page)
  await selectOption(page, 'Monto pagado', /S\/30\.00/i)
  await page.locator('input[name="numero_voucher"]').fill('123456789012345')
  await page.locator('input[type="file"]').setInputFiles({
    name: 'voucher.png',
    mimeType: 'image/png',
    buffer: Buffer.from('this-is-not-a-png'),
  })

  await expect(page.getByText(/El archivo no es valido\. Use PDF, JPG o PNG/i)).toBeVisible()
  await expect(page.getByText(/Archivo cargado/i)).toHaveCount(0)

  const requests = await getMockRequests(request)
  expect(requests.filter((item) => item.path === '/upload/vouchers')).toHaveLength(0)
})

test('muestra el estado not found para un identificador final invalido', async ({ page }) => {
  await page.goto('/solicitud-constancias/finalizar?id=invalido')
  await expect(page.getByRole('heading', { name: /Solicitud no identificada/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Volver a constancias/i })).toBeVisible()
})

test('reintenta solo el correo de constancia', async ({ page, request }) => {
  await verifyConstanciaEmail(page, request)
  await setMockScenario(request, { mailFailuresRemaining: 1 })
  await completeConstanciaForm(page)
  await page.getByRole('button', { name: 'Finalizar' }).click()

  await expect(page.getByText(/solicitud 1003 ya esta guardada/i)).toBeVisible()
  const beforeRetry = await getMockRequests(request)
  expect(beforeRetry.filter((item) => item.path === '/solicitudes')).toHaveLength(1)

  await page.getByRole('button', { name: /Reintentar correo/i }).click()
  await expect(page).toHaveURL(/\/solicitud-constancias\/finalizar\?id=1003&receipt=/)

  const afterRetry = await getMockRequests(request)
  expect(afterRetry.filter((item) => item.path === '/solicitudes')).toHaveLength(1)
  expect(afterRetry.filter((item) => item.path === '/mailer' && (item.body as { type?: string })?.type === 'CERTIFICADO')).toHaveLength(2)
})
