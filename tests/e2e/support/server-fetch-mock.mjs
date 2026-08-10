const nativeFetch = globalThis.fetch

globalThis.fetch = async function e2eFetch(input, init) {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

  if (url.startsWith('https://api.q10.com/v1/programas')) {
    return nativeFetch('http://127.0.0.1:4100/__test/q10-programs')
  }

  if (url === 'https://www.google.com/recaptcha/api/siteverify') {
    return new Response(JSON.stringify({ success: true, hostname: '127.0.0.1' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return nativeFetch(input, init)
}
