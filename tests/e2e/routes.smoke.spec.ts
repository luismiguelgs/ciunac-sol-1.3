import { expect, test } from '@playwright/test'
import { installBrowserMocks } from './support/browser-mocks'

const routes = [
  { path: '/', content: /Solicitud de Certificados/i },
  { path: '/consulta-certificado', content: /CIUNAC/i },
  { path: '/consulta-certificado/CERT-E2E', content: /Detalle de Certificado/i },
  { path: '/consulta-solicitud', content: /Consulta de Solicitud/i },
  { path: '/consulta-solicitud/12345678', content: /Consulta del Estado/i },
  { path: '/consulta-ubicacion', content: /Consulta de Solicitud/i },
  {
    path: '/consulta-ubicacion/12345678?nombres=Maria&apellidos=Prueba&id=1002',
    content: /Notas del Alumno/i,
  },
  { path: '/solicitud-beca', content: /correo electr/i },
  { path: '/solicitud-beca/finalizar', content: /Proceso Finalizado/i },
  { path: '/solicitud-beca/proceso?email=e2e%40example.com', content: /Solicitud de Beca/i },
  { path: '/solicitud-certificados', content: /correo electr/i },
  { path: '/solicitud-certificados/finalizar?id=1001', content: /Proceso Finalizado/i },
  { path: '/solicitud-certificados/proceso?email=e2e%40example.com', content: /Informaci/i },
  { path: '/solicitud-constancias', content: /correo electr/i },
  { path: '/solicitud-constancias/proceso?email=e2e%40example.com', content: /Informaci/i },
  { path: '/solicitud-nuevo', content: /Verificaci/i },
  { path: '/solicitud-nuevo/finalizar', content: /Proceso Finalizado/i },
  { path: '/solicitud-ubicacion', content: /correo electr/i },
  { path: '/solicitud-ubicacion/finalizar?id=1002', content: /Proceso Finalizado/i },
  {
    path: '/solicitud-ubicacion/proceso?email=e2e%40example.com&alumno_ciunac=false',
    content: /Datos B/i,
  },
]

test.describe('Rutas publicas actuales', () => {
  for (const route of routes) {
    test(`${route.path} responde y muestra contenido`, async ({ page }) => {
      await installBrowserMocks(page)
      const pageErrors: string[] = []
      page.on('pageerror', (error) => pageErrors.push(error.message))

      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' })

      expect(response, `No se recibio respuesta para ${route.path}`).not.toBeNull()
      expect(response?.status(), `Estado HTTP inesperado para ${route.path}`).toBeLessThan(400)
      await expect(page.locator('body')).toContainText(route.content)
      await expect(page.locator('body')).not.toContainText(/Internal Server Error|Application error/i)
      expect(pageErrors).toEqual([])
    })
  }
})

test('la portada navega al flujo de certificados', async ({ page }) => {
  await installBrowserMocks(page)
  await page.goto('/')

  await page.getByRole('link', { name: /Ir a Solicitud de Certificados/i }).click()

  await expect(page).toHaveURL(/\/solicitud-certificados$/)
  await expect(page.getByRole('heading', { name: /correo electr/i })).toBeVisible()
})
