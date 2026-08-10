import { expect, test, type Page } from '@playwright/test'
import { installBrowserMocks, resetMockApi, setMockScenario } from './support/browser-mocks'

test.beforeEach(async ({ page, request }) => {
  await resetMockApi(request)
  await installBrowserMocks(page)
})

test('consulta una solicitud por documento', async ({ page }) => {
  await page.goto('/consulta-solicitud')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()

  await expect(page).toHaveURL(/\/consulta-solicitud\/12345678$/)
  await expect(page.getByText(/PRUEBA E2E MARIA/i).first()).toBeVisible()
  await expect(page.getByText(/CERTIFICADO DE ESTUDIOS/i)).toBeVisible()
  await expect(page.getByText('EXAMEN DE UBICACION', { exact: true })).toHaveCount(0)
})

test('mantiene las solicitudes visibles cuando fallan los textos auxiliares', async ({ page, request }) => {
  await setMockScenario(request, { textsError: true })
  await page.goto('/consulta-solicitud')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()

  await expect(page.getByText(/CERTIFICADO DE ESTUDIOS/i)).toBeVisible()
  await expect(page.getByText(/Informacion complementaria no disponible/i)).toBeVisible()
})

test('muestra error de ruta ante solicitudes mal formadas', async ({ page, request }) => {
  await setMockScenario(request, { malformedRequestsAfterFirst: true })
  await page.goto('/consulta-solicitud')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()

  await expect(page.getByText(/No se pudieron consultar las solicitudes/i)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible()
})

test('muestra el documento digital solo cuando la solicitud esta lista', async ({ page, request }) => {
  await setMockScenario(request, { readyDigitalCertificate: true })
  await page.goto('/consulta-solicitud')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()

  await expect(page.getByRole('button', { name: /Descargar Certificado/i })).toBeVisible()
})

test('consulta un certificado y muestra sus notas', async ({ page }) => {
  await page.goto('/consulta-solicitud')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page).toHaveURL(/\/consulta-solicitud\/12345678$/)

  await page.goto('/consulta-certificado/CERT-E2E')

  await expect(page.getByRole('heading', { name: /Detalle de Certificado/i })).toBeVisible()
  await expect(page.getByText('REG-E2E-001')).toBeVisible()
  await expect(page.getByRole('cell', { name: '90' })).toBeVisible()
})

test('consulta el resultado del examen de ubicacion', async ({ page }) => {
  await openLocationConsultation(page)
  await expect(page.getByText(/MARIA PRUEBA E2E/i)).toBeVisible()
  await expect(page.getByText('88/100')).toBeVisible()
  await expect(page.getByText('BASICO 2')).toBeVisible()
  await expect(page.getByRole('button', { name: /Descargar Constancia/i })).toBeVisible()
})

test('muestra un estado explicito cuando la consulta queda sin solicitudes', async ({ page, request }) => {
  await setMockScenario(request, { emptyRequestsAfterFirst: true })
  await page.goto('/consulta-solicitud')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()

  await expect(page.getByRole('heading', { name: /No se encontraron solicitudes/i })).toBeVisible()
})

test('muestra certificado sin notas sin lanzar un error', async ({ page, request }) => {
  await setMockScenario(request, { certificateWithoutNotes: true })
  await page.goto('/consulta-solicitud')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page).toHaveURL(/\/consulta-solicitud\/12345678$/)

  await page.goto('/consulta-certificado/CERT-E2E')
  await expect(page.getByText(/No hay notas disponibles/i)).toBeVisible()
  await expect(page.getByText('REG-E2E-001')).toBeVisible()
})

test('muestra certificado no disponible ante una respuesta vacia', async ({ page, request }) => {
  await setMockScenario(request, { emptyCertificateResponse: true })
  await page.goto('/consulta-solicitud')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page).toHaveURL(/\/consulta-solicitud\/12345678$/)

  await page.goto('/consulta-certificado/CERT-E2E')
  await expect(page.getByRole('heading', { name: /Certificado no disponible/i })).toBeVisible()
})

test('muestra error de ruta ante un certificado mal formado', async ({ page, request }) => {
  await setMockScenario(request, { malformedCertificate: true })
  await page.goto('/consulta-solicitud')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page).toHaveURL(/\/consulta-solicitud\/12345678$/)

  await page.goto('/consulta-certificado/CERT-E2E')
  await expect(page.getByText(/No se pudo consultar el certificado/i)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible()
})

test('no expone un certificado perteneciente a otro documento', async ({ page, request }) => {
  await setMockScenario(request, { certificateOwnerMismatch: true })
  await page.goto('/consulta-solicitud')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page).toHaveURL(/\/consulta-solicitud\/12345678$/)

  await page.goto('/consulta-certificado/CERT-E2E')
  await expect(page.getByRole('heading', { name: /Certificado no disponible/i })).toBeVisible()
  await expect(page.getByText('REG-E2E-001')).toHaveCount(0)
})

test('muestra certificado no disponible ante un 404 real', async ({ page, request }) => {
  await setMockScenario(request, { certificateNotFound: true })
  await page.goto('/consulta-solicitud')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page).toHaveURL(/\/consulta-solicitud\/12345678$/)

  await page.goto('/consulta-certificado/CERT-E2E')
  await expect(page.getByRole('heading', { name: /Certificado no disponible/i })).toBeVisible()
})

test('distingue un error tecnico de la ausencia de notas de ubicacion', async ({ page, request }) => {
  await setMockScenario(request, { locationDetailsError: true })
  await openLocationConsultation(page)

  await expect(page.getByText(/No se pudieron cargar las notas/i)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible()
})

test('muestra estado vacio y conserva el cargo cuando aun no hay notas de ubicacion', async ({ page, request }) => {
  await setMockScenario(request, { emptyLocationDetails: true })
  await openLocationConsultation(page)

  await expect(page.getByText(/Aún no se encontraron notas/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /Descargar Cargo/i })).toBeVisible()
})

test('muestra error de ruta ante resultados de ubicacion mal formados', async ({ page, request }) => {
  await setMockScenario(request, { malformedLocationDetails: true })
  await openLocationConsultation(page)

  await expect(page.getByText(/No se pudieron cargar las notas/i)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible()
})

test('muestra nota parcial y bloquea la constancia cuando falta el examen relacionado', async ({ page, request }) => {
  await setMockScenario(request, { locationMissingExam: true })
  await openLocationConsultation(page)

  await expect(page.getByText('88/100')).toBeVisible()
  await expect(page.getByText(/Constancia aún no disponible/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /Descargar Constancia/i })).toHaveCount(0)
})

test('mantiene la nota pero bloquea la constancia cuando no se recupera el año', async ({ page, request }) => {
  await setMockScenario(request, { textsError: true })
  await openLocationConsultation(page)

  await expect(page.getByText('88/100')).toBeVisible()
  await expect(page.getByText(/Nombre del año no disponible/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /Descargar Constancia/i })).toHaveCount(0)
})

test('no expone resultados de ubicacion pertenecientes a otro documento', async ({ page, request }) => {
  await setMockScenario(request, { foreignLocationDetails: true })
  await openLocationConsultation(page)

  await expect(page.getByText(/Aún no se encontraron notas/i)).toBeVisible()
  await expect(page.getByText('88/100')).toHaveCount(0)
})

async function openLocationConsultation(page: Page) {
  await page.goto('/consulta-ubicacion')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page).toHaveURL(/\/consulta-ubicacion\/12345678$/)
}
