import { getFileViolation, type FileMetadata, type FilePolicy } from '@/modules/shared/domain/file-validation'

export type {
  FileMetadata as LocationDocumentMetadata,
  FileViolation as LocationDocumentViolation,
} from '@/modules/shared/domain/file-validation'

export const MAX_LOCATION_DOCUMENT_BYTES = 8 * 1024 * 1024
export const locationIdentityPolicy: FilePolicy = {
  maxBytes: MAX_LOCATION_DOCUMENT_BYTES,
  allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
}
export const locationStudyCertificatePolicy: FilePolicy = {
  maxBytes: MAX_LOCATION_DOCUMENT_BYTES,
  allowedMimeTypes: ['application/pdf'],
}

export function getIdentityDocumentViolation(file: FileMetadata) {
  return getFileViolation(file, locationIdentityPolicy)
}

export function getStudyCertificateViolation(file: FileMetadata) {
  return getFileViolation(file, locationStudyCertificatePolicy)
}
