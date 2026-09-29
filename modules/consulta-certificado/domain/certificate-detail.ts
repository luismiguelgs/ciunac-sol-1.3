export type CertificateNote = {
  cycle: string
  modality: string
  grade: number
}

export type CertificateDelivery =
  | { status: 'pending'; acceptedAt: null }
  | { status: 'accepted'; acceptedAt: string }

export type CertificateDetail = {
  studentName: string
  language: string
  level: string
  hours: number
  issuedAt: string
  registrationNumber: string
  completedAt: string
  delivery: CertificateDelivery
  notes: CertificateNote[]
}

export function sortCertificateNotes(notes: CertificateNote[]): CertificateNote[] {
  return notes
    .map((note, index) => ({ note, index, order: trailingNumber(note.cycle) }))
    .sort((left, right) => left.order - right.order || left.index - right.index)
    .map(({ note }) => note)
}

function trailingNumber(value: string): number {
  const match = value.match(/(\d+)\s*$/)
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}
