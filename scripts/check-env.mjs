import nextEnv from '@next/env'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

const checks = [
  { name: 'API_URL', validate: isUrl },
  { name: 'API_KEY', validate: isPresent },
  { name: 'API_KEY_Q10', validate: isPresent },
  { name: 'APP_BASE_URL', validate: isUrl },
  { name: 'RECAPTCHA_SECRET_KEY', validate: isPresent },
  { name: 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY', validate: isPresent },
  { name: 'OTP_SESSION_SECRET', validate: hasMinimumBytes },
]

function isPresent(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isUrl(value) {
  if (!isPresent(value)) return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function hasMinimumBytes(value) {
  return isPresent(value) && Buffer.byteLength(value, 'utf8') >= 32
}

let failed = false
for (const check of checks) {
  const status = check.validate(process.env[check.name]) ? 'PRESENT' : 'MISSING_OR_INVALID'
  process.stdout.write(`${check.name}: ${status}\n`)
  if (status !== 'PRESENT') failed = true
}

if (isPresent(process.env.NEXT_PUBLIC_API_KEY)) {
  process.stdout.write('NEXT_PUBLIC_API_KEY: DEPRECATED_REMOVE_AFTER_ROTATION\n')
  failed = true
} else {
  process.stdout.write('NEXT_PUBLIC_API_KEY: ABSENT\n')
}

if (isPresent(process.env.NEXT_PUBLIC_API_URL)) {
  process.stdout.write('NEXT_PUBLIC_API_URL: LEGACY_SERVER_ONLY_FALLBACK\n')
}

if (failed) process.exitCode = 1
