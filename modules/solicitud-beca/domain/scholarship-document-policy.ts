import { getFileViolation, type FileMetadata, type FilePolicy } from '@/modules/shared/domain/file-validation'

export type { FileViolation as ScholarshipDocumentViolation } from '@/modules/shared/domain/file-validation'

export const MAX_SCHOLARSHIP_DOCUMENT_BYTES = 8 * 1024 * 1024
export const SCHOLARSHIP_DOCUMENT_MIME = 'application/pdf'
export const scholarshipDocumentPolicy: FilePolicy = {
  maxBytes: MAX_SCHOLARSHIP_DOCUMENT_BYTES,
  allowedMimeTypes: [SCHOLARSHIP_DOCUMENT_MIME],
}

export function getScholarshipDocumentViolation(file: FileMetadata) {
  return getFileViolation(file, scholarshipDocumentPolicy)
}
