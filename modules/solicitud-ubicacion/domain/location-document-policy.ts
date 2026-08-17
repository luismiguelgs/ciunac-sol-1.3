export const MAX_LOCATION_DOCUMENT_BYTES = 8 * 1024 * 1024

export const LOCATION_IDENTITY_DOCUMENT_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
} as const

export type LocationIdentityDocumentMimeType = keyof typeof LOCATION_IDENTITY_DOCUMENT_TYPES

export type LocationDocumentMetadata = {
  name: string
  size: number
  mimeType: string
}

export type LocationDocumentViolation =
  | 'EMPTY'
  | 'TOO_LARGE'
  | 'INVALID_MIME'
  | 'INVALID_EXTENSION'

export function getIdentityDocumentViolation(
  file: LocationDocumentMetadata,
): LocationDocumentViolation | null {
  if (file.size <= 0) return 'EMPTY'
  if (file.size > MAX_LOCATION_DOCUMENT_BYTES) return 'TOO_LARGE'
  if (!isLocationIdentityDocumentMimeType(file.mimeType)) return 'INVALID_MIME'

  const extension = getExtension(file.name)
  if (!LOCATION_IDENTITY_DOCUMENT_TYPES[file.mimeType].includes(extension as never)) {
    return 'INVALID_EXTENSION'
  }
  return null
}

export function getStudyCertificateViolation(
  file: LocationDocumentMetadata,
): LocationDocumentViolation | null {
  if (file.size <= 0) return 'EMPTY'
  if (file.size > MAX_LOCATION_DOCUMENT_BYTES) return 'TOO_LARGE'
  if (file.mimeType !== 'application/pdf') return 'INVALID_MIME'
  if (getExtension(file.name) !== '.pdf') return 'INVALID_EXTENSION'
  return null
}

export function isLocationIdentityDocumentMimeType(
  value: string,
): value is LocationIdentityDocumentMimeType {
  return Object.hasOwn(LOCATION_IDENTITY_DOCUMENT_TYPES, value)
}

function getExtension(fileName: string): string {
  const separator = fileName.lastIndexOf('.')
  return separator >= 0 ? fileName.slice(separator).toLowerCase() : ''
}
