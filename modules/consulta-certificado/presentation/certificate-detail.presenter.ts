import type { CertificateDetail } from '@/modules/consulta-certificado/domain/certificate-detail'

export type CertificateDetailPresentation = {
  courseLanguage: string
  courseLevel: string
  issuedAt: string
  completedAt: string
  delivered: string
  acceptedAt: string | null
}

export function presentCertificateDetail(certificate: CertificateDetail): CertificateDetailPresentation {
  return {
    courseLanguage: certificate.language,
    courseLevel: formatCertificateLevel(certificate.level),
    issuedAt: formatCertificateDate(certificate.issuedAt),
    completedAt: formatCertificateDate(certificate.completedAt),
    delivered: certificate.delivery.status === 'accepted' ? 'Sí' : 'No',
    acceptedAt: certificate.delivery.status === 'accepted'
      ? formatCertificateDate(certificate.delivery.acceptedAt)
      : null,
  }
}

export function formatCertificateLevel(value: string): string {
  const level = value.trim().replace(/\s+\d+\s*$/, '')
  const normalized = level.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()

  if (normalized === 'BASICO') return 'BÁSICO'
  if (normalized === 'INTERMEDIO') return 'INTERMEDIO'
  if (normalized === 'AVANZADO') return 'AVANZADO'

  return level
}

export function formatCertificateDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'No disponible'
    : date.toLocaleDateString('es-PE', { timeZone: 'UTC' })
}
