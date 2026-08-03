import { expect, Page, test } from '@playwright/test'
import {
  getMockRequests,
  installBrowserMocks,
  resetMockApi,
} from './support/browser-mocks'

async function selectOption(page: Page, label: string, option: RegExp) {
  await page.getByLabel(label, { exact: true }).click()
  await page.getByRole('option', { name: option }).click()
}

test.beforeEach(async ({ page, request }) => {
  await resetMockApi(request)
  await installBrowserMocks(page)
})

test('verifica el correo y entra al proceso de certificados', async ({ page, request }) => {
  await page.goto('/solicitud-certificados')

  await expect(page.locator('[data-e2e-recaptcha="ready"]')).toBeAttached()
  await page.locator('input[name="email"]').fill('e2e@example.com')
  await page.getByRole('button', { name: /Comprobar/i }).click()

  const otp = page.locator('input[data-input-otp]')
  await expect(otp).toBeEnabled()
  const verificationNumber = await page.evaluate(() => {
    const stored = sessionStorage.getItem('verificationNumber')
    return stored ? String(JSON.parse(stored).randomNumber) : ''
  })
  expect(verificationNumber).toMatch(/^\d{4}$/)
  await otp.fill(verificationNumber)
  await page.getByRole('button', { name: /Enviar/i }).click()

  await expect(page).toHaveURL(/\/solicitud-certificados\/proceso\?email=e2e%40example\.com$/)
  const requests = await getMockRequests(request)
  expect(requests).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ method: 'POST', path: '/mailer' }),
    ]),
  )
})

test('registra una solicitud de certificado de extremo a extremo', async ({ page, request }) => {
  await page.goto('/solicitud-certificados/proceso?email=e2e%40example.com')

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
    (response) => response.url().endsWith('/upload/vouchers') && response.request().method() === 'POST',
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

  await expect(page).toHaveURL(/\/solicitud-certificados\/finalizar\?id=1001$/)
  await expect(page.getByRole('button', { name: /Descargar Cargo/i })).toBeVisible()

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
