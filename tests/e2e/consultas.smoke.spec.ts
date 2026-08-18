import { expect, test, type Page } from '@playwright/test'
import { getMockRequests, installBrowserMocks, resetMockApi, setMockScenario } from './support/browser-mocks'

test.beforeEach(async ({ page, request }) => {
  await resetMockApi(request)
  await installBrowserMocks(page)
})

test('@smoke consulta una solicitud por documento', async ({ page }) => {
  await page.goto('/consulta-solicitud')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()

  await expect(page).toHaveURL(/\/consulta-solicitud\/12345678$/)
  await expect(page.getByText(/PRUEBA E2E MARIA/i).first()).toBeVisible()
  await expect(page.getByText(/CERTIFICADO DE ESTUDIOS/i)).toBeVisible()
  await expect(page.getByText('EXAMEN DE UBICACION', { exact: true })).toHaveCount(0)

  const cargoButtons = page.getByRole('button', { name: '12345678-INGLES-BASICO.pdf' })
  await expect(cargoButtons).toHaveCount(2)
  for (const index of [0, 1]) {
    const downloadPromise = page.waitForEvent('download')
    await cargoButtons.nth(index).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('12345678-INGLES-BASICO.pdf')
  }
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

test('permite descargar certificados historicos con documento numerico', async ({ page, request }) => {
  await setMockScenario(request, {
    readyDigitalCertificate: true,
    legacyNumericCertificateDocument: true,
  })
  await page.goto('/consulta-solicitud')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()

  await expect(page.getByRole('button', { name: /Descargar Certificado/i })).toBeVisible()
})

test('muestra la constancia digital con su variante independiente cuando esta lista', async ({ page, request }) => {
  await setMockScenario(request, {
    readyDigitalConstancia: true,
    legacyConstanciaAliases: true,
  })
  await page.goto('/consulta-solicitud')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()

  await expect(page.getByRole('button', { name: /Descargar Constancia/i })).toBeVisible()
})

test('bloquea descargas duplicadas de una constancia aceptada', async ({ page, request }) => {
  await setMockScenario(request, { readyDigitalConstancia: true })
  await page.goto('/consulta-solicitud')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()

  let downloadCount = 0
  page.on('download', () => { downloadCount += 1 })

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Descargar Constancia' }).click()
  await downloadPromise

  const busyButton = page.getByRole('button', { name: 'Descargando Constancia...' })
  await expect(busyButton).toBeDisabled()
  await expect(busyButton).toHaveAttribute('aria-busy', 'true')

  await busyButton.evaluate((element) => {
    element.removeAttribute('disabled')
    if (element instanceof HTMLElement) element.click()
  })
  await page.waitForTimeout(100)
  expect(downloadCount).toBe(1)

  await expect(page.getByRole('button', { name: 'Descargar Constancia' })).toBeEnabled()
})

test('evita aceptar dos veces una constancia pendiente', async ({ page, request }) => {
  await setMockScenario(request, {
    readyDigitalConstancia: true,
    pendingDigitalConstancia: true,
    constanciaAcceptanceDelayMs: 300,
  })
  await page.goto('/consulta-solicitud')
  await page.locator('input[name="documento"]').fill('12345678')
  await page.getByRole('button', { name: 'Buscar' }).click()

  await page.getByRole('button', { name: 'Descargar Constancia' }).click()
  await page.getByLabel(/Declaro haber leido y aceptar/i).check()

  const acceptButton = page.getByRole('button', { name: 'Aceptar y descargar' })
  const downloadPromise = page.waitForEvent('download')
  await acceptButton.click()

  const processingButton = page.getByRole('button', { name: 'Procesando...' })
  await expect(processingButton).toBeDisabled()
  await processingButton.evaluate((element) => {
    element.removeAttribute('disabled')
    if (element instanceof HTMLElement) element.click()
  })
  await downloadPromise

  const providerRequests = await getMockRequests(request)
  expect(providerRequests.filter((item) => (
    item.method === 'PATCH' && item.path === '/constancias/CONST-E2E'
  ))).toHaveLength(1)
})

test('@smoke consulta un certificado y muestra sus notas', async ({ page }) => {
  const browserRequests: string[] = []
  let browserSentApiKey = false
  page.on('request', (request) => {
    browserRequests.push(request.url())
    browserSentApiKey ||= Boolean(request.headers()['x-api-key'])
  })

  await page.goto('/consulta-certificado/CERT-E2E')

  await expect(page).toHaveURL(/\/consulta-certificado\/CERT-E2E$/)
  await expect(page.getByRole('heading', { name: /Detalle de Certificado/i })).toBeVisible()
  await expect(page.getByText('REG-E2E-001')).toBeVisible()
  await expect(page.getByRole('cell', { name: '90' })).toBeVisible()
  expect(browserRequests.some((url) => url.startsWith('http://127.0.0.1:4100'))).toBe(false)
  expect(browserSentApiKey).toBe(false)
})

test('@smoke consulta el resultado del examen de ubicacion', async ({ page }) => {
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
  await page.goto('/consulta-certificado/CERT-E2E')
  await expect(page.getByText(/No hay notas disponibles/i)).toBeVisible()
  await expect(page.getByText('REG-E2E-001')).toBeVisible()
})

test('muestra certificado no disponible ante una respuesta vacia', async ({ page, request }) => {
  await setMockScenario(request, { emptyCertificateResponse: true })
  await page.goto('/consulta-certificado/CERT-E2E')
  await expect(page.getByRole('heading', { name: /Certificado no disponible/i })).toBeVisible()
})

test('muestra error de ruta ante un certificado mal formado', async ({ page, request }) => {
  await setMockScenario(request, { malformedCertificate: true })
  await page.goto('/consulta-certificado/CERT-E2E')
  await expect(page.getByText(/No se pudo consultar el certificado/i)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible()
})

test('muestra certificado no disponible ante un 404 real', async ({ page, request }) => {
  await setMockScenario(request, { certificateNotFound: true })
  await page.goto('/consulta-certificado/CERT-E2E')
  await expect(page.getByRole('heading', { name: /Certificado no disponible/i })).toBeVisible()
})

test('rechaza un identificador de certificado con formato invalido sin consultar el proveedor', async ({ page, request }) => {
  await page.goto('/consulta-certificado/CERT!INVALID')
  await expect(page.getByRole('heading', { name: /Certificado no disponible/i })).toBeVisible()

  const upstreamRequests = await request.get('http://127.0.0.1:4100/__test/requests')
  const requests = await upstreamRequests.json() as Array<{ path: string }>
  expect(requests.some((item) => item.path.startsWith('/certificados/'))).toBe(false)
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
  const downloadButton = page.getByRole('button', { name: /Descargar Cargo/i })
  await expect(downloadButton).toBeVisible()
  const downloadPromise = page.waitForEvent('download')
  await downloadButton.click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('UBICACION-12345678-1002.pdf')

  const providerRequests = await getMockRequests(request)
  expect(providerRequests.filter((item) => item.path === '/solicitudes/1002')).toHaveLength(0)
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
