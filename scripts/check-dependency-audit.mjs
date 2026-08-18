import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const baselinePath = join(process.cwd(), 'docs', 'quality', 'dependency-audit-baseline.json')
const reportDirectory = join(process.cwd(), 'test-results')
const reportPath = join(reportDirectory, 'dependency-audit.json')
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'))
const npmCli = process.env.npm_execpath

if (!npmCli) {
  process.stderr.write('No se pudo localizar npm para ejecutar la auditoria.\n')
  process.exit(1)
}

const auditProcess = spawnSync(process.execPath, [npmCli, 'audit', '--omit=dev', '--json'], {
  cwd: process.cwd(),
  encoding: 'utf8',
  windowsHide: true,
  maxBuffer: 10 * 1024 * 1024,
})

let audit
try {
  audit = JSON.parse(auditProcess.stdout)
} catch {
  process.stderr.write('npm audit no devolvio un informe JSON valido.\n')
  if (auditProcess.stderr) process.stderr.write(auditProcess.stderr)
  process.exit(1)
}

mkdirSync(reportDirectory, { recursive: true })
writeFileSync(reportPath, `${JSON.stringify(audit, null, 2)}\n`)

if (!audit.vulnerabilities || !audit.metadata?.vulnerabilities) {
  process.stderr.write(`La auditoria no pudo completarse: ${audit.message ?? 'respuesta desconocida'}.\n`)
  process.exit(1)
}

const known = new Set(baseline.advisories.map((item) => String(item.source)))
const current = collectBlockingAdvisories(audit.vulnerabilities)
const unknown = current.filter((item) => !known.has(item.source))
const stillPresent = current.filter((item) => known.has(item.source))
const expired = Date.now() > Date.parse(`${baseline.expiresOn}T23:59:59.999Z`)
const counts = audit.metadata.vulnerabilities

process.stdout.write(
  `Auditoria de produccion: ${counts.total} hallazgos; ${counts.high} high; ${counts.critical} critical.\n`,
)

if (unknown.length > 0) {
  process.stderr.write(`Se detectaron vulnerabilidades high/critical nuevas: ${formatItems(unknown)}.\n`)
  process.exitCode = 1
}

if (expired && stillPresent.length > 0) {
  process.stderr.write(
    `La excepcion de auditoria vencio el ${baseline.expiresOn}: ${formatItems(stillPresent)}.\n`,
  )
  process.exitCode = 1
}

if (!process.exitCode && stillPresent.length > 0) {
  process.stdout.write(
    `Excepciones temporales vigentes hasta ${baseline.expiresOn}: ${formatItems(stillPresent)}.\n`,
  )
}

if (!process.exitCode && current.length === 0) {
  process.stdout.write('No se detectaron vulnerabilidades high/critical de produccion.\n')
}

function collectBlockingAdvisories(vulnerabilities) {
  const findings = new Map()

  for (const [packageName, vulnerability] of Object.entries(vulnerabilities)) {
    if (!['high', 'critical'].includes(vulnerability.severity)) continue
    collectFromPackage(packageName, packageName, new Set())
  }

  return [...findings.values()]

  function collectFromPackage(packageName, rootPackage, visited) {
    if (visited.has(packageName)) return
    visited.add(packageName)
    const vulnerability = vulnerabilities[packageName]
    if (!vulnerability) {
      findings.set(`package:${packageName}`, {
        source: `package:${packageName}`,
        package: rootPackage,
        severity: 'high',
      })
      return
    }

    for (const via of vulnerability.via) {
      if (typeof via === 'string') {
        collectFromPackage(via, rootPackage, visited)
        continue
      }
      if (!['high', 'critical'].includes(via.severity)) continue
      findings.set(String(via.source), {
        source: String(via.source),
        package: rootPackage,
        severity: via.severity,
      })
    }
  }
}

function formatItems(items) {
  return items.map((item) => `${item.package}:${item.source}:${item.severity}`).join(', ')
}
