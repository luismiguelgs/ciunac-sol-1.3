import path from 'node:path'

const sharedModules = new Set(['shared', 'security'])
const inwardLayers = {
  domain: ['domain'],
  application: ['domain', 'application'],
  infrastructure: ['domain', 'application', 'infrastructure'],
  presentation: ['domain', 'application', 'presentation', 'schemas', 'client'],
}
const frameworkOrHttp = /^(react(?:-dom)?|next|zustand|react-hook-form|lucide-react|@react[^/]*\/[^/]+|axios|ky|undici|https?|node:(?:https?|net|tls))(\/|$)/

function describe(file) {
  const normalized = path.posix.normalize(file.replaceAll('\\', '/')).replace(/\.(?:[cm]?[jt]sx?)$/, '')
  const [root, module, part, ...rest] = normalized.split('/')
  const member = [part, ...rest].filter(Boolean).join('/')
  const rootValidation = member === 'schemas'
  const layer = root === 'modules'
    ? (rootValidation ? 'application' : ({ model: 'domain', operations: 'application', components: 'presentation', store: 'presentation' }[part] ?? part))
    : null
  return { path: normalized, module: root === 'modules' ? module : null, member, layer }
}

function isFeature(module) {
  return Boolean(module) && !sharedModules.has(module)
}

function isServerImport(specifier, target) {
  return specifier === 'server-only' || specifier.startsWith('node:')
    || /^next\/(headers|server)(\/|$)/.test(specifier)
    || Boolean(target && /(^|\/)server(\/|$)|\.server$/.test(target.path))
    || Boolean(target?.path.startsWith('app/api/'))
}

const architectureDependencies = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      publicApi: 'Consume {{feature}} mediante su API publica (index o server), no sus archivos internos.',
      pure: 'Las reglas de negocio no deben depender de React, Next.js, UI, estado ni HTTP.',
      layer: 'Esta dependencia sale de las responsabilidades permitidas para {{layer}}.',
      browser: 'El codigo del navegador y la API de UI no deben importar codigo exclusivo del servidor.',
      shared: 'Shared y security no deben depender de features de negocio.',
      http: 'La UI y las reglas de negocio no deben ejecutar fetch directamente; usa la integracion correspondiente.',
    },
  },
  create(context) {
    const sourcePath = path.relative(context.cwd, context.filename).replaceAll('\\', '/')
    const source = describe(sourcePath)
    const pure = ['domain', 'application'].includes(source.layer)
    const browser = source.layer === 'presentation' || source.layer === 'client'
      || (isFeature(source.module) && source.member === 'index')
      || context.sourceCode.ast.body.some((node) => node.directive === 'use client')

    function check(node) {
      if (typeof node?.value !== 'string') return
      const specifier = node.value
      const localPath = specifier.startsWith('@/') ? specifier.slice(2)
        : specifier.startsWith('.') ? path.posix.join(path.posix.dirname(sourcePath), specifier) : null
      const target = localPath === null ? null : describe(localPath)
      const report = (messageId, data) => context.report({ node, messageId, data })

      if (target && isFeature(target.module) && target.module !== source.module
        && !['', 'index', 'server'].includes(target.member)) {
        return report('publicApi', { feature: target.module })
      }
      if (browser && isServerImport(specifier, target)) return report('browser')
      if (pure && (frameworkOrHttp.test(specifier) || isServerImport(specifier, target))) return report('pure')
      if (!target) return

      if (sharedModules.has(source.module) && isFeature(target.module)) return report('shared')
      if (pure && !target.module) return report('pure')

      if (target.module === source.module && inwardLayers[source.layer]
        && !inwardLayers[source.layer].includes(target.layer)) {
        return report('layer', { layer: source.layer })
      }
      if (pure && target.module !== source.module) {
        // Consultas already uses this framework-free error type; preserve that contract.
        const sharedError = target.path === 'modules/shared/application/errors/app-error'
        const allowed = target.module === 'shared'
          && (sharedError || inwardLayers[source.layer].includes(target.layer))
        if (!allowed) return report('pure')
      }
      if (isFeature(source.module) && isFeature(target.module) && source.module !== target.module) {
        // The existing consultation context is shared through its public API only.
        const consultationContext = target.module === 'consultas'
          && (source.module === 'consulta-solicitud' || source.module === 'consulta-ubicacion')
        if (inwardLayers[source.layer] && !consultationContext) return report('layer', { layer: source.layer })
      }
      if (source.layer === 'presentation') {
        const infrastructure = target.layer === 'infrastructure'
          || target.path === 'lib/api.service' || target.path.startsWith('services/')
        if (infrastructure) return report('layer', { layer: source.layer })
      }
    }

    return {
      ImportDeclaration: (node) => check(node.source),
      ExportNamedDeclaration: (node) => check(node.source),
      ExportAllDeclaration: (node) => check(node.source),
      ImportExpression: (node) => check(node.source),
      TSImportType: (node) => check(node.source),
      TSExternalModuleReference: (node) => check(node.expression),
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'require') check(node.arguments[0])
        const directFetch = node.callee.type === 'Identifier' && node.callee.name === 'fetch'
        const memberFetch = node.callee.type === 'MemberExpression' && !node.callee.computed
          && ['window', 'globalThis'].includes(node.callee.object.name) && node.callee.property.name === 'fetch'
        if ((pure || source.layer === 'presentation') && (directFetch || memberFetch)) {
          context.report({ node, messageId: 'http' })
        }
      },
    }
  },
}

export default architectureDependencies
