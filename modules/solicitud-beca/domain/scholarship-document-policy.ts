export const MAX_SCHOLARSHIP_DOCUMENT_BYTES = 8 * 1024 * 1024
export const SCHOLARSHIP_DOCUMENT_MIME = 'application/pdf'

export type ScholarshipDocumentMetadata = {
  name: string
  size: number
  mimeType: string
}

export type ScholarshipDocumentViolation =
  | 'EMPTY'
  | 'TOO_LARGE'
  | 'INVALID_MIME'
  | 'INVALID_EXTENSION'

export function getScholarshipDocumentViolation(
  file: ScholarshipDocumentMetadata,
): ScholarshipDocumentViolation | null {
  if (file.size <= 0) return 'EMPTY'
  if (file.size > MAX_SCHOLARSHIP_DOCUMENT_BYTES) return 'TOO_LARGE'
  if (file.mimeType !== SCHOLARSHIP_DOCUMENT_MIME) return 'INVALID_MIME'
  if (!file.name.toLowerCase().endsWith('.pdf')) return 'INVALID_EXTENSION'
  return null
}
