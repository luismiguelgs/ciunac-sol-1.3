import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const fixturePath = fileURLToPath(new URL('../fixtures/api-data.json', import.meta.url))
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'))
const nativeFetch = globalThis.fetch

globalThis.fetch = async function e2eFetch(input, init) {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

  if (url.startsWith('https://api.q10.com/v1/programas')) {
    return new Response(JSON.stringify(fixture.q10Programs), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (url === 'https://www.google.com/recaptcha/api/siteverify') {
    return new Response(JSON.stringify({ success: true, hostname: '127.0.0.1' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return nativeFetch(input, init)
}
