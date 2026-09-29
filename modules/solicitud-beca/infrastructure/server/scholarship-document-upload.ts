import 'server-only'

import { validateFileUpload } from '@/modules/shared/infrastructure/server/file-upload-validation'
import { scholarshipDocumentPolicy } from '../../domain/scholarship-document-policy'

export function validateScholarshipDocumentUpload(formData: FormData): Promise<File> {
  return validateFileUpload(formData, scholarshipDocumentPolicy)
}
