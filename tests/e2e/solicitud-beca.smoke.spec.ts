import { expect, Page, test } from '@playwright/test'
import {
  getMockOtp,
  getMockRequests,
  installBrowserMocks,
  resetMockApi,
  setMockScenario,
} from './support/browser-mocks'

const PDF_FILE = {
  name: 'documento.pdf',
  mimeType: 'application/pdf',
  buffer: Buffer.from('%PDF-1.4\n%%EOF'),
}

async function selectOption(page: Page, label: string, option: RegExp) {
  await page.getByLabel(label, { exact: true }).click()
  await page.getByRole('option', { name: option }).click()
}

async function verifyScholarshipEmail(page: Page, request: Parameters<typeof getMockOtp>[0]) {
  await page.goto('/solicitud-beca')
  await expect(page.locator('[data-e2e-recaptcha="ready"]')).toBeAttached()
  await page.locator('input[name="email"]').fill('e2e@example.com')
  await page.getByRole('button', { name: /Comprobar correo y enviar código/i }).click()
  const otp = page.locator('input[data-input-otp]')
  await expect(otp).toBeEnabled()
  await otp.fill(await getMockOtp(request))
  await page.getByRole('button', { name: /Verificar código y continuar/i }).click()
  await expect(page).toHaveURL(/\/solicitud-beca\/proceso$/)
}

async function completeBasicData(page: Page) {
  await page.locator('input[name="apellidos"]').fill('PEREZ LOPEZ')
  await page.locator('input[name="nombres"]').fill('MARIA')
  await selectOption(page, 'Facultad', /INGENIERIA/i)
  await selectOption(page, 'Escuela', /INGENIERIA DE SISTEMAS/i)
  await page.locator('input[name="codigo"]').fill('20260001')
  await page.locator('input[name="direccion"]').fill('CALLAO')
  await page.locator('input[name="celular"]').fill('999888777')
  await page.locator('input[name="dni"]').fill('12345678')
  await page.getByRole('button', { name: 'Siguiente' }).click()
}

async function completeDocuments(page: Page) {
  const fileInputs = page.locator('input[type="file"]')
  await expect(fileInputs).toHaveCount(5)
  for (let index = 0; index < 5; index += 1) {
    await fileInputs.nth(index).setInputFiles(PDF_FILE)
  }
  await expect(page.getByText(/Archivo cargado/i)).toHaveCount(5)
  await page.getByRole('button', { name: 'Siguiente' }).click()
}

async function confirmScholarship(page: Page) {
  await page.getByRole('switch', { name: /Confirmo que los datos/i }).click()
  await page.getByRole('switch', { name: /Acepto los términos/i }).click()
}

async function completeScholarshipForm(page: Page) {
  await completeBasicData(page)
  await completeDocuments(page)
  await confirmScholarship(page)
}

test.beforeEach(async ({ page, request }) => {
  await resetMockApi(request)
  await installBrowserMocks(page)
})

test('registra una beca con cinco documentos tipados', async ({ page, request }) => {
  await verifyScholarshipEmail(page, request)
  await completeScholarshipForm(page)
  await page.getByRole('button', { name: 'Finalizar' }).click()

  await expect(page).toHaveURL(/\/solicitud-beca\/finalizar\?id=BECA-E2E&receipt=/)
  await expect(page.getByText(/servicio acepto el correo/i)).toBeVisible()

  const requests = await getMockRequests(request)
  const scholarshipRequest = requests.find((item) => item.path === '/solicitudbecas')
  expect(scholarshipRequest?.body).toMatchObject({
    nombres: 'MARIA',
    apellidos: 'PEREZ LOPEZ',
    numero_documento: '12345678',
    facultadId: '1',
    escuelaId: '1',
    contancia_tercio: '/images/upload.svg',
  })
  expect(requests.filter((item) => item.path === '/upload/becas')).toHaveLength(5)
  expect(requests.filter((item) => item.path === '/solicitudbecas')).toHaveLength(1)
  expect(requests).toEqual(expect.arrayContaining([
    expect.objectContaining({ method: 'POST', path: '/mailer', body: expect.objectContaining({ type: 'BECA' }) }),
  ]))
})

test('rechaza acceso directo al proceso de beca sin sesión', async ({ page }) => {
  await page.goto('/solicitud-beca/proceso')
  await expect(page).toHaveURL(/\/solicitud-beca$/)
})

test('rechaza un PDF de beca con firma falsificada', async ({ page, request }) => {
  await verifyScholarshipEmail(page, request)
  await completeBasicData(page)
  await page.locator('input[type="file"]').first().setInputFiles({
    name: 'documento.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('not-a-pdf'),
  })

  await expect(page.getByText(/El archivo no es valido/i)).toBeVisible()
  const requests = await getMockRequests(request)
  expect(requests.filter((item) => item.path === '/upload/becas')).toHaveLength(0)
})

for (const scenario of ['emptyScholarshipResponse', 'malformedScholarshipResponse'] as const) {
  test(`detiene el correo ante ${scenario}`, async ({ page, request }) => {
    await verifyScholarshipEmail(page, request)
    await setMockScenario(request, { [scenario]: true })
    await completeScholarshipForm(page)
    await page.getByRole('button', { name: 'Finalizar' }).click()

    const expectedMessage = scenario === 'emptyScholarshipResponse'
      ? /El servicio no devolvio los datos esperados/i
      : /No se pudo confirmar el identificador de la beca/i
    await expect(page.getByText(expectedMessage)).toBeVisible()
    const requests = await getMockRequests(request)
    expect(requests.filter((item) => item.path === '/mailer' && (item.body as { type?: string })?.type === 'BECA')).toHaveLength(0)
  })
}

test('reintenta solo el correo de beca', async ({ page, request }) => {
  await verifyScholarshipEmail(page, request)
  await setMockScenario(request, { mailFailuresRemaining: 1 })
  await completeScholarshipForm(page)
  await page.getByRole('button', { name: 'Finalizar' }).click()

  await expect(page.getByText(/solicitud BECA-E2E ya está guardada/i)).toBeVisible()
  expect((await getMockRequests(request)).filter((item) => item.path === '/solicitudbecas')).toHaveLength(1)
  await page.getByRole('button', { name: /Reintentar correo/i }).click()
  await expect(page).toHaveURL(/\/solicitud-beca\/finalizar\?id=BECA-E2E&receipt=/)

  const requests = await getMockRequests(request)
  expect(requests.filter((item) => item.path === '/solicitudbecas')).toHaveLength(1)
  expect(requests.filter((item) => item.path === '/mailer' && (item.body as { type?: string })?.type === 'BECA')).toHaveLength(2)
})

test('muestra error de ruta cuando los catálogos académicos están vacíos', async ({ page, request }) => {
  await setMockScenario(request, { emptyScholarshipCatalogs: true })
  await verifyScholarshipEmail(page, request)
  await expect(page.getByRole('heading', { name: /No se pudo abrir la solicitud de beca/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Reintentar/i })).toBeVisible()
})

test('muestra error de ruta cuando una escuela no pertenece a una facultad disponible', async ({ page, request }) => {
  await setMockScenario(request, { inconsistentScholarshipCatalogs: true })
  await verifyScholarshipEmail(page, request)
  await expect(page.getByRole('heading', { name: /No se pudo abrir la solicitud de beca/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Reintentar/i })).toBeVisible()
})

test('muestra not-found para un identificador final inválido', async ({ page }) => {
  await page.goto('/solicitud-beca/finalizar?id=valor%20inválido')
  await expect(page.getByRole('heading', { name: /Solicitud de beca no identificada/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Volver a becas/i })).toBeVisible()
})
