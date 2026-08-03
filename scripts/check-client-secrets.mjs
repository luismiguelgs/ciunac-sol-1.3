import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import nextEnv from '@next/env'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

const staticDirectory = join(process.cwd(), '.next', 'static')
if (!existsSync(staticDirectory)) {
  process.stderr.write('No existe .next/static. Ejecute npm run build antes de esta comprobacion.\n')
  process.exit(1)
}

const candidates = [
  'API_KEY',
  'API_KEY_Q10',
  'RECAPTCHA_SECRET_KEY',
  'OTP_SESSION_SECRET',
  'NEXT_PUBLIC_API_KEY',
].flatMap((name) => {
  const value = process.env[name]
  return value && value.length >= 4 ? [{ name, value }] : []
})

function listFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? listFiles(path) : [path]
  })
}

const files = listFiles(staticDirectory)
const exposed = new Set()

for (const file of files) {
  const contents = readFileSync(file)
  for (const candidate of candidates) {
    if (contents.includes(Buffer.from(candidate.value))) exposed.add(candidate.name)
  }
}

if (exposed.size > 0) {
  process.stderr.write(`Se detectaron secretos privados en el bundle: ${[...exposed].join(', ')}\n`)
  process.exit(1)
}

process.stdout.write('No se detectaron valores privados configurados en .next/static.\n')
