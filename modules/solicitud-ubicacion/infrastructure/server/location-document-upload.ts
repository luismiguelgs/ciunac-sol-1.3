import 'server-only'

import { validateFileUpload } from '@/modules/shared/infrastructure/server/file-upload-validation'
import { locationIdentityPolicy, locationStudyCertificatePolicy } from '../../domain/location-document-policy'

export function validateIdentityDocumentUpload(formData: FormData): Promise<File> {
  return validateFileUpload(formData, locationIdentityPolicy)
}

export function validateLocationStudyCertificateUpload(formData: FormData): Promise<File> {
  return validateFileUpload(formData, locationStudyCertificatePolicy)
}
