import 'server-only'

import { SecurityError } from '@/modules/security/server/security-error'
import {
  getScholarshipDocumentViolation,
} from '@/modules/solicitud-beca/domain/scholarship-document-policy'

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d]

export async function validateScholarshipDocumentUpload(formData: FormData): Promise<File> {
  const file = formData.get('file')
  if (!(file instanceof File)) {
    throw new SecurityError('INVALID_FILE', 400, 'Scholarship document is missing')
  }

  const violation = getScholarshipDocumentViolation({
    name: file.name,
    size: file.size,
    mimeType: file.type,
  })
  if (violation) {
    throw new SecurityError(
      'INVALID_FILE',
      violation === 'TOO_LARGE' ? 413 : 400,
      'Scholarship document metadata is invalid',
    )
  }

  const bytes = new Uint8Array(await file.slice(0, PDF_SIGNATURE.length).arrayBuffer())
  const signatureMatches = PDF_SIGNATURE.every((expected, index) => bytes[index] === expected)
  if (!signatureMatches) {
    throw new SecurityError('INVALID_FILE', 400, 'Scholarship document signature is invalid')
  }

  return file
}
