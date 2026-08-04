import { expect, test } from '@playwright/test'
import { getMockOtp, installBrowserMocks, resetMockApi } from './support/browser-mocks'

test.beforeEach(async ({ page, request }) => {
  await resetMockApi(request)
  await installBrowserMocks(page)
})

test('separa la comprobacion del correo de la verificacion OTP para alumno nuevo', async ({ page, request }) => {
  await page.goto('/solicitud-nuevo')
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

  await expect(page.getByLabel('Primer Apellido')).toBeVisible()
})
