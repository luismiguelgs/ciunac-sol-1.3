import {
  getIdentityDocumentViolation,
  getStudyCertificateViolation,
  type LocationDocumentMetadata,
  type LocationDocumentViolation,
} from '@/modules/solicitud-ubicacion/domain/location-document-policy'

export function validateIdentityDocumentFile(file: File): string | null {
  return toFileMessage(getIdentityDocumentViolation(toMetadata(file)), 'identity')
}

export function validateStudyCertificateFile(file: File): string | null {
  return toFileMessage(getStudyCertificateViolation(toMetadata(file)), 'study')
}

function toMetadata(file: File): LocationDocumentMetadata {
  return { name: file.name, size: file.size, mimeType: file.type }
}

function toFileMessage(
  violation: LocationDocumentViolation | null,
  kind: 'identity' | 'study',
): string | null {
  if (!violation) return null
  if (violation === 'EMPTY') return 'El archivo esta vacio.'
  if (violation === 'TOO_LARGE') return 'El archivo supera el limite de 8 MB.'
  if (violation === 'INVALID_EXTENSION') return 'La extension del archivo no coincide con su formato.'
  return kind === 'study'
    ? 'Solo se permiten archivos PDF.'
    : 'Solo se permiten archivos PDF, JPG y PNG.'
}
