import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import baseline from './accessibility-baseline.json'
import { installBrowserMocks } from './support/browser-mocks'

const routes = [
  { path: '/', content: /Solicitud de Certificados/i },
  { path: '/solicitud-certificados', content: /correo electr/i },
  { path: '/solicitud-constancias', content: /correo electr/i },
  { path: '/solicitud-beca', content: /correo electr/i },
  { path: '/solicitud-ubicacion', content: /correo electr/i },
  { path: '/solicitud-nuevo', content: /Verificaci/i },
  { path: '/consulta-solicitud', content: /Consulta de Solicitud/i },
  { path: '/consulta-ubicacion', content: /Consulta de Solicitud/i },
  { path: '/consulta-certificado/CERT-E2E', content: /Detalle de Certificado/i },
]

type BaselineException = {
  route: string
  rule: string
  target: string
}

const baselineExceptions = new Set(
  baseline.exceptions.map((item: BaselineException) => fingerprint(item)),
)

for (const route of routes) {
  test(`@a11y ${route.path} no introduce barreras criticas`, async ({ page }, testInfo) => {
    await installBrowserMocks(page)
    const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' })

    expect(response?.status()).toBeLessThan(400)
    await expect(page.locator('body')).toContainText(route.content)

    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    await testInfo.attach('axe-results', {
      body: JSON.stringify(result, null, 2),
      contentType: 'application/json',
    })

    const current = result.violations
      .filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')
      .flatMap((violation) => violation.nodes.map((node) => ({
        route: route.path,
        rule: violation.id,
        target: node.target.join(' > '),
      })))
    const newViolations = current.filter((item) => !baselineExceptions.has(fingerprint(item)))
    const expiredExceptions = isExpired(baseline.expiresOn)
      ? current.filter((item) => baselineExceptions.has(fingerprint(item)))
      : []

    expect(
      [...newViolations, ...expiredExceptions],
      `Violaciones critical/serious nuevas o con excepcion vencida en ${route.path}`,
    ).toEqual([])
  })
}

function fingerprint(item: BaselineException): string {
  return `${item.route}::${item.rule}::${item.target}`
}

function isExpired(expiresOn: string): boolean {
  const expiration = Date.parse(`${expiresOn}T23:59:59.999Z`)
  return Number.isNaN(expiration) || Date.now() > expiration
}
