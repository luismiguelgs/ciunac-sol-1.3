import { expect, test } from '@playwright/test'
import { installBrowserMocks, resetMockApi } from './support/browser-mocks'

test.beforeEach(async ({ page, request }) => {
  await resetMockApi(request)
  await installBrowserMocks(page)
})

test('consulta una solicitud por documento', async ({ page }) => {
  await page.goto('/consulta-solicitud')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()

  await expect(page).toHaveURL(/\/consulta-solicitud\/12345678$/)
  await expect(page.getByText(/PRUEBA E2E MARIA/i)).toBeVisible()
  await expect(page.getByText(/CERTIFICADO DE ESTUDIOS/i)).toBeVisible()
})

test('consulta un certificado y muestra sus notas', async ({ page }) => {
  await page.goto('/consulta-certificado/CERT-E2E')

  await expect(page.getByRole('heading', { name: /Detalle de Certificado/i })).toBeVisible()
  await expect(page.getByText('REG-E2E-001')).toBeVisible()
  await expect(page.getByRole('cell', { name: '90' })).toBeVisible()
})

test('consulta el resultado del examen de ubicacion', async ({ page }) => {
  await page.goto('/consulta-ubicacion')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()

  await expect(page).toHaveURL(/\/consulta-ubicacion\/12345678\?.*id=1002/)
  await expect(page.getByText(/MARIA PRUEBA E2E/i)).toBeVisible()
  await expect(page.getByText('88/100')).toBeVisible()
  await expect(page.getByText('BASICO 2')).toBeVisible()
})
