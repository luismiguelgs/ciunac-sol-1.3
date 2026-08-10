export type CertificateNote = {
  cycle: string
  period: string
  modality: string
  grade: number
}

export type CertificateDelivery =
  | { status: 'pending'; acceptedAt: null }
  | { status: 'accepted'; acceptedAt: string }

export type CertificateDetail = {
  id: string
  type: 'VIRTUAL' | 'FISICO'
  studentName: string
  documentNumber: string
  language: string
  level: string
  hours: number
  requestId: number
  issuedAt: string
  registrationNumber: string
  completedAt: string
  delivery: CertificateDelivery
  notes: CertificateNote[]
}

export type CertificateCourseLabels = {
  language: string
  level: string
}

export function normalizeCertificateLookupId(value: string): string | null {
  const id = value.trim()
  return /^[A-Za-z0-9_-]{1,80}$/.test(id) ? id : null
}

export function normalizeCertificateDocument(value: string): string {
  return value.trim().toUpperCase()
}

export function sortCertificateNotes(notes: CertificateNote[]): CertificateNote[] {
  return notes
    .map((note, index) => ({ note, index, order: trailingNumber(note.cycle) }))
    .sort((left, right) => left.order - right.order || left.index - right.index)
    .map(({ note }) => note)
}

export function resolveCertificateCourseLabels(certificate: CertificateDetail): CertificateCourseLabels {
  const firstCycle = certificate.notes[0]?.cycle.trim() ?? ''
  const parts = firstCycle.split(/\s+/).filter(Boolean)

  return {
    language: parts.length > 1 ? parts[0] : certificate.language,
    level: parts.length > 1 ? parts.slice(1).join(' ') : certificate.level,
  }
}

function trailingNumber(value: string): number {
  const match = value.match(/(\d+)\s*$/)
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}
