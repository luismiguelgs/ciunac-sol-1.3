import { expect, Page, test } from '@playwright/test'
import {
  getMockOtp,
  getMockRequests,
  installBrowserMocks,
  resetMockApi,
  setMockScenario,
} from './support/browser-mocks'

async function verifyNewStudentEmail(page: Page, request: Parameters<typeof getMockOtp>[0]) {
  await page.goto('/solicitud-nuevo')
  await expect(page.locator('[data-e2e-recaptcha="ready"]')).toBeAttached()
  const otp = page.locator('input[data-input-otp]')
  const verifyButton = page.getByRole('button', { name: /Verificar c.digo y continuar/i })
  await expect(otp).toBeDisabled()
  await expect(verifyButton).toBeDisabled()
  await page.locator('input[name="email"]').fill('e2e@example.com')
  await page.getByRole('button', { name: /Comprobar correo y enviar c.digo/i }).click()
  await expect(page.getByText(/C.digo enviado/i)).toBeVisible()
  await otp.fill(await getMockOtp(request))
  await verifyButton.click()
  await expect(page.getByLabel('Primer Apellido')).toBeVisible()
}

async function chooseBirthDate(page: Page) {
  await page.getByRole('button', { name: /Seleccionar fecha/i }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('combobox').nth(1).click()
  await page.getByRole('option', { name: '2000', exact: true }).click()
  const firstDay = page.locator('[role="gridcell"] button').filter({ hasText: /^1$/ }).last()
  await expect(firstDay).toBeVisible()
  await firstDay.click()
  await page.keyboard.press('Escape')
}

async function completeBasicData(page: Page) {
  await page.getByLabel('Primer Apellido').fill('PEREZ')
  await page.getByLabel('Segundo Apellido').fill('LOPEZ')
  await page.getByLabel('Primer Nombre').fill('MARIA')
  await chooseBirthDate(page)
  await page.locator('input[name="phone"]').fill('999888777')
  await page.getByLabel('Programa').click()
  await page.getByRole('option', { name: /INGLES E2E/i }).click()
  await page.getByLabel('Documento de Identidad').click()
  await page.locator('input[name="document"]').fill('12345678')
  await page.getByLabel('Femenino').click()
  await page.getByRole('button', { name: 'Siguiente' }).click()
  await expect(page.getByText('INGLES E2E')).toBeVisible()
}

async function confirmRegistration(page: Page) {
  await page.getByRole('switch', { name: /Los datos proporcionados/i }).click()
  await page.getByRole('switch', { name: /Acepta todos los t.rminos/i }).click()
}

async function completeNewStudentForm(page: Page, request: Parameters<typeof getMockOtp>[0]) {
  await verifyNewStudentEmail(page, request)
  await completeBasicData(page)
  await confirmRegistration(page)
}

test.beforeEach(async ({ page, request }) => {
  await resetMockApi(request)
  await installBrowserMocks(page)
})

test('separa la comprobacion del correo de la verificacion OTP para alumno nuevo', async ({ page, request }) => {
  await verifyNewStudentEmail(page, request)
})

test('registra un alumno nuevo con DTO Q10 tipado y comprobante de correo', async ({ page, request }) => {
  await completeNewStudentForm(page, request)
  await page.getByRole('button', { name: 'Finalizar' }).click()

  await expect(page).toHaveURL(/\/solicitud-nuevo\/finalizar\?receipt=/)
  await expect(page.getByText(/Estudiante guardado exitosamente/i)).toBeVisible()
  await expect(page.getByText(/servicio acepto el correo/i)).toBeVisible()

  const requests = await getMockRequests(request)
  const q10Request = requests.find((item) => item.path === '/q10/estudiantes')
  expect(q10Request?.body).toEqual({
    Primer_apellido: 'PEREZ',
    Segundo_apellido: 'LOPEZ',
    Primer_nombre: 'MARIA',
    Email: 'e2e@example.com',
    Codigo_tipo_identificacion: 'PE01',
    Numero_identificacion: '12345678',
    Genero: 'F',
    Fecha_nacimiento: expect.stringMatching(/^\d{4}-\d{2}-01T00:00:00\.000Z$/),
    Telefono: '999888777',
    Celular: '999888777',
    Codigo_programa: 'ING-E2E',
  })
  expect(requests.filter((item) => item.path === '/q10/estudiantes')).toHaveLength(1)
  expect(requests).toEqual(expect.arrayContaining([
    expect.objectContaining({ method: 'POST', path: '/mailer', body: expect.objectContaining({ type: 'REGISTER' }) }),
  ]))
})

test('acepta una confirmacion Q10 sin cuerpo', async ({ page, request }) => {
  await setMockScenario(request, { emptyQ10RegistrationResponse: true })
  await completeNewStudentForm(page, request)
  await page.getByRole('button', { name: 'Finalizar' }).click()
  await expect(page).toHaveURL(/\/solicitud-nuevo\/finalizar\?receipt=/)
  expect((await getMockRequests(request)).filter((item) => item.path === '/q10/estudiantes')).toHaveLength(1)
})

test('detiene el correo ante una respuesta Q10 mal formada', async ({ page, request }) => {
  await setMockScenario(request, { malformedQ10RegistrationResponse: true })
  await completeNewStudentForm(page, request)
  await page.getByRole('button', { name: 'Finalizar' }).click()
  await expect(page.getByText(/Q10 devolvio una respuesta no valida/i)).toBeVisible()
  const requests = await getMockRequests(request)
  expect(requests.filter((item) => item.path === '/q10/estudiantes')).toHaveLength(1)
  expect(requests.filter((item) => item.path === '/mailer' && (item.body as { type?: string })?.type === 'REGISTER')).toHaveLength(0)
})

test('reintenta solo el correo de alumno nuevo', async ({ page, request }) => {
  await setMockScenario(request, { mailFailuresRemaining: 1 })
  await completeNewStudentForm(page, request)
  await page.getByRole('button', { name: 'Finalizar' }).click()
  await expect(page.getByText(/ya fue registrado/i)).toBeVisible()
  expect((await getMockRequests(request)).filter((item) => item.path === '/q10/estudiantes')).toHaveLength(1)
  await page.getByRole('button', { name: /Reintentar correo/i }).click()
  await expect(page).toHaveURL(/\/solicitud-nuevo\/finalizar\?receipt=/)
  const requests = await getMockRequests(request)
  expect(requests.filter((item) => item.path === '/q10/estudiantes')).toHaveLength(1)
  expect(requests.filter((item) => item.path === '/mailer' && (item.body as { type?: string })?.type === 'REGISTER')).toHaveLength(2)
})

test('rechaza un correo distinto al verificado antes de llegar a Q10', async ({ page, request }) => {
  await completeNewStudentForm(page, request)
  await page.route('**/api/ciunac/q10/estudiantes', async (route) => {
    const body = JSON.parse(route.request().postData() ?? '{}')
    await route.continue({ postData: JSON.stringify({ ...body, Email: 'otro@example.com' }) })
  })
  await page.getByRole('button', { name: 'Finalizar' }).click()
  await expect(page.getByText(/La solicitud no es valida/i)).toBeVisible()
  expect((await getMockRequests(request)).filter((item) => item.path === '/q10/estudiantes')).toHaveLength(0)
})

test('rechaza un programa manipulado antes de llegar a Q10', async ({ page, request }) => {
  await completeNewStudentForm(page, request)
  await page.route('**/api/ciunac/q10/estudiantes', async (route) => {
    const body = JSON.parse(route.request().postData() ?? '{}')
    await route.continue({ postData: JSON.stringify({ ...body, Codigo_programa: 'UNKNOWN' }) })
  })
  await page.getByRole('button', { name: 'Finalizar' }).click()
  await expect(page.getByText(/La solicitud no es valida/i)).toBeVisible()
  expect((await getMockRequests(request)).filter((item) => item.path === '/q10/estudiantes')).toHaveLength(0)
})

test('muestra estado vacio cuando Q10 no ofrece programas', async ({ page, request }) => {
  await setMockScenario(request, { emptyQ10Programs: true })
  await page.goto('/solicitud-nuevo')
  await expect(page.getByRole('heading', { name: /No hay programas disponibles/i })).toBeVisible()
})

test('muestra error de ruta cuando Q10 devuelve un catalogo invalido', async ({ page, request }) => {
  await setMockScenario(request, { malformedQ10Programs: true })
  await page.goto('/solicitud-nuevo')
  await expect(page.getByText(/No se pudieron consultar los programas de Q10/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /Reintentar/i })).toBeVisible()
})

test('no afirma exito cuando falta el comprobante final', async ({ page }) => {
  await page.goto('/solicitud-nuevo/finalizar')
  await expect(page.getByRole('heading', { name: /Estado no confirmado/i })).toBeVisible()
  await expect(page.getByText(/Estudiante guardado exitosamente/i)).toHaveCount(0)
})
