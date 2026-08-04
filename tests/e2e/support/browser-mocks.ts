import { expect, Page, APIRequestContext } from '@playwright/test'

const transparentPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

export async function installBrowserMocks(page: Page) {
  await page.addInitScript(() => {
    const grecaptcha = {
      ready(callback: () => void) { callback() },
      render(container: Element | null) {
        container?.setAttribute('data-e2e-recaptcha', 'ready')
        return 1
      },
      getResponse() { return 'e2e-recaptcha-token' },
      reset() {},
      execute() { return Promise.resolve('e2e-recaptcha-token') },
    }

    Object.defineProperty(window, 'grecaptcha', {
      configurable: true,
      value: grecaptcha,
      writable: true,
    })
  })

  await page.route(/^https?:\/\//, async (route) => {
    const hostname = new URL(route.request().url()).hostname
    if (hostname === '127.0.0.1' || hostname === 'localhost') {
      await route.continue()
      return
    }
    await route.abort('blockedbyclient')
  })

  await page.route('**/_next/image?*', async (route) => {
    const source = new URL(route.request().url()).searchParams.get('url') ?? ''
    if (/^https?:\/\//i.test(source)) {
      await route.fulfill({ status: 200, contentType: 'image/png', body: transparentPng })
      return
    }
    await route.continue()
  })

  await page.route(/recaptcha\/api\.js/, async (route) => {
    const callback = new URL(route.request().url()).searchParams.get('onload')
    const callbackCall = callback
      ? `setTimeout(() => window[${JSON.stringify(callback)}]?.(), 0);`
      : ''

    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        (() => {
          let widgetId = 1;
          window.grecaptcha = {
            ready(callback) { callback(); },
            render(container) {
              const id = widgetId++;
              if (container) container.setAttribute('data-e2e-recaptcha', 'ready');
              return id;
            },
            getResponse() { return 'e2e-recaptcha-token'; },
            reset() {},
            execute() { return Promise.resolve('e2e-recaptcha-token'); }
          };
          ${callbackCall}
        })();
      `,
    })
  })
}

export async function resetMockApi(request: APIRequestContext) {
  const response = await request.post('http://127.0.0.1:4100/__test/reset')
  expect(response.ok()).toBeTruthy()
}

export async function setMockScenario(request: APIRequestContext, scenario: Record<string, unknown>) {
  const response = await request.post('http://127.0.0.1:4100/__test/scenario', { data: scenario })
  expect(response.ok()).toBeTruthy()
}

export async function getMockRequests(request: APIRequestContext) {
  const response = await request.get('http://127.0.0.1:4100/__test/requests')
  expect(response.ok()).toBeTruthy()
  return response.json() as Promise<Array<{
    method: string
    path: string
    body: unknown
    hasApiKey: boolean
  }>>
}

export async function getMockOtp(request: APIRequestContext) {
  const response = await request.get('http://127.0.0.1:4100/__test/otp')
  expect(response.ok()).toBeTruthy()
  const payload = await response.json() as { code: number | null }
  expect(payload.code).not.toBeNull()
  return String(payload.code).padStart(6, '0')
}
