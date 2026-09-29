import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ESLint } from 'eslint'
import { beforeAll, describe, expect, it } from 'vitest'

const cwd = fileURLToPath(new URL('../../../', import.meta.url))
const eslint = new ESLint({ cwd })
const rule = 'architecture/dependencies'
const features = [
  'consulta-certificado', 'consulta-solicitud', 'consulta-ubicacion', 'consultas',
  'solicitud-beca', 'solicitud-certificado', 'solicitud-constancia',
  'solicitud-nuevo', 'solicitud-ubicacion',
]

async function violations(file: string, code: string) {
  const [result] = await eslint.lintText(code, { filePath: path.join(cwd, file) })
  expect(result.messages.filter((message) => message.fatal)).toEqual([])
  return result.messages.filter((message) => message.ruleId === rule)
}

describe('effective architecture configuration', () => {
  beforeAll(async () => {
    // Loading Next.js ESLint plugins is setup work, not part of the first case.
    await eslint.calculateConfigForFile(path.join(cwd, 'modules/consulta-certificado/domain/example.ts'))
  }, 30_000)

  it.each(features)('protects the public API and pure code of %s without overrides', async (feature) => {
    const file = `modules/${feature}/domain/example.ts`
    const config = await eslint.calculateConfigForFile(path.join(cwd, file))
    expect(config.rules[rule]).toEqual([2])
    expect(await violations(file, "import 'react'\nimport '@/lib/api.service'"))
      .toHaveLength(2)
    expect(await violations('app/example/page.tsx', `import '@/modules/${feature}/domain/example'`))
      .toHaveLength(1)
    expect(await violations('app/example/page.tsx', `import '@/modules/${feature}'\nimport '@/modules/${feature}/server'`))
      .toHaveLength(0)
  })

  it.each([
    "import '@/modules/solicitud-ubicacion/domain/example'",
    "export * from '@/modules/solicitud-ubicacion/domain/example'",
    "export { example } from '@/modules/solicitud-ubicacion/domain/example'",
    "void import('@/modules/solicitud-ubicacion/domain/example')",
    "require('@/modules/solicitud-ubicacion/domain/example')",
    "import example = require('@/modules/solicitud-ubicacion/domain/example')",
    "import type { Example } from '@/modules/solicitud-ubicacion/domain/example'",
    "type Example = import('@/modules/solicitud-ubicacion/domain/example').Example",
    "import '../../modules/solicitud-ubicacion/domain/example.ts'",
    "void import('../../modules/solicitud-ubicacion/domain/example')",
    "import '@/modules/solicitud-ubicacion/server/../domain/example'",
  ])('rejects deep imports regardless of syntax: %s', async (code) => {
    expect(await violations('app/example/page.tsx', code)).toHaveLength(1)
  })

  it.each([
    ['domain', "import '../application/example'"],
    ['domain', "import 'next/navigation'"],
    ['domain', "import 'zustand'"],
    ['application', "import '../infrastructure/example'"],
    ['application', "import 'node:https'"],
    ['application', "import '@/modules/security/server/session'"],
    ['application', "import '@/modules/shared/components/fin-data'"],
    ['infrastructure', "import '../presentation/example'"],
    ['presentation', "import '../infrastructure/example'"],
    ['presentation', "import '@/modules/shared/infrastructure/http/browser-http'"],
    ['presentation', "import '@/modules/solicitud-constancia'"],
    ['presentation', "import '@/services/storage.service'"],
    ['presentation', "import '@/modules/security/server/session'"],
    ['presentation', "void fetch('/api/ciunac/estudiantes')"],
    ['application', "void globalThis.fetch('/api/ciunac/estudiantes')"],
  ])('blocks outward dependencies from %s: %s', async (layer, code) => {
    expect(await violations(`modules/solicitud-certificado/${layer}/example.ts`, code)).toHaveLength(1)
  })

  it.each([
    ['modules/solicitud-certificado/domain/example.ts', "import './solicitud-certificado'"],
    ['modules/solicitud-certificado/application/example.ts', "import '../domain/solicitud-certificado'\nimport 'zod'"],
    ['modules/solicitud-certificado/application/example.ts', "import '@/modules/shared/application/errors/app-error'"],
    ['modules/solicitud-certificado/infrastructure/example.ts', "import '../application/example'\nimport '@/modules/security/server/ciunac-client'"],
    ['modules/solicitud-certificado/presentation/example.ts', "import '../client'\nimport '../domain/solicitud-certificado'\nimport '@/components/ui/button'"],
    ['modules/solicitud-certificado/client.ts', "'use client'\nimport './application/example'\nimport './infrastructure/api/example'"],
    ['modules/solicitud-certificado/server.ts', "import 'server-only'\nimport './infrastructure/server/example'"],
    ['modules/solicitud-certificado/index.ts', "export * from './presentation/example'"],
    ['modules/consulta-ubicacion/infrastructure/example.ts', "import '@/modules/consultas/server'"],
    ['modules/consulta-solicitud/presentation/example.ts', "import type { ConsultedRequest } from '@/modules/consultas'"],
    ['modules/consultas/domain/example.ts', "import '@/modules/shared/application/errors/app-error'"],
    ['modules/solicitud-nuevo/presentation/example.ts', "import '@/modules/security/client/security-client'"],
    ['app/api/ciunac/example.ts', "import '@/modules/solicitud-beca/server'"],
    ['modules/solicitud-certificado/presentation/example.ts', "void import('@/modules/shared/components/administrative-cargo-pdf')"],
    ['modules/shared/components/example.tsx', "import '@/modules/shared/schemas/verification.schema'"],
  ])('preserves supported consumers in %s', async (file, code) => {
    expect(await violations(file, code)).toHaveLength(0)
  })

  it.each([
    ['app/example/page.tsx', "'use client'\nimport '@/modules/solicitud-beca/server'"],
    ['components/example.tsx', "'use client'\nvoid import('../modules/security/server/environment')"],
    ['modules/solicitud-beca/client.ts', "import './server'"],
    ['modules/solicitud-beca/index.ts', "export * from './server'"],
    ['modules/shared/components/example.tsx', "import '@/modules/solicitud-beca'"],
    ['modules/security/server/example.ts', "import '@/modules/solicitud-beca/server'"],
    ['modules/solicitud-beca/model.ts', "import 'react'"],
    ['modules/solicitud-beca/operations.ts', "import './client'"],
    ['modules/solicitud-beca/components/example.tsx', "import '../server'"],
    ['modules/solicitud-beca/store.ts', "import './infrastructure/example'"],
  ])('protects client, shared and optional flat boundaries in %s', async (file, code) => {
    expect(await violations(file, code)).toHaveLength(1)
  })

  it('also checks consumers outside app and modules', async () => {
    for (const folder of ['components', 'lib', 'services']) {
      expect(await violations(`${folder}/example.ts`, "import '@/modules/solicitud-beca/domain/solicitud-beca'"))
        .toHaveLength(1)
    }
  })

  it('allows the flat certificate operations to use pure request validation', async () => {
    expect(await violations('modules/solicitud-certificado/operations.ts', "import './schemas'\nimport './model'"))
      .toHaveLength(0)
    expect(await violations('modules/solicitud-certificado/schemas.ts', "import './model'\nimport 'zod'"))
      .toHaveLength(0)
  })

  it.each(["import 'react'", "import './client'", "import './infrastructure/certificate-client'"])(
    'protects flat request validation from outward imports: %s', async (code) => {
      expect(await violations('modules/solicitud-certificado/schemas.ts', code)).toHaveLength(1)
    },
  )

  it('keeps internal imports available to unit tests', async () => {
    const config = await eslint.calculateConfigForFile(path.join(cwd, 'tests/unit/example.test.ts'))
    expect(config.rules[rule]).toBeUndefined()
  })

  it('requires the public consultation API even in the security route', async () => {
    const code = "import '@/modules/consultas/domain/consulted-request'\nimport '@/modules/consultas/infrastructure/server/consultation.repository'"
    expect(await violations('app/api/security/consulta/route.ts', code)).toHaveLength(2)
    expect(await violations('app/api/security/consulta/route.ts', "import '@/modules/consultas/server'")).toHaveLength(0)
    expect(await violations('app/api/security/other/route.ts', code)).toHaveLength(2)
    expect(await violations('app/api/security/consulta/route.ts', "import '@/modules/consultas/infrastructure/validation/consultation.schemas'"))
      .toHaveLength(1)
  })
})
