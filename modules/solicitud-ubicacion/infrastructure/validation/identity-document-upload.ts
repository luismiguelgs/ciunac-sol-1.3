import 'server-only'

import { SecurityError } from '@/modules/security/server/security-error'
import {
  IdentityDocumentMimeType,
  MAX_IDENTITY_DOCUMENT_BYTES,
  validateIdentityDocumentMetadata,
} from '@/modules/solicitud-ubicacion/domain/identity-document-policy'

const FILE_SIGNATURES: Record<IdentityDocumentMimeType, readonly number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46, 0x2d],
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  'image/jpeg': [0xff, 0xd8, 0xff],
}

export async function validateIdentityDocumentUpload(formData: FormData): Promise<File> {
  const file = formData.get('file')
  if (!(file instanceof File)) throw new SecurityError('INVALID_FILE', 400, 'Identity document is missing')

  const metadataError = validateIdentityDocumentMetadata(file)
  if (metadataError) {
    throw new SecurityError(
      'INVALID_FILE',
      file.size > MAX_IDENTITY_DOCUMENT_BYTES ? 413 : 400,
      metadataError,
    )
  }

  const signature = FILE_SIGNATURES[file.type as IdentityDocumentMimeType]
  const bytes = new Uint8Array(await file.slice(0, signature.length).arrayBuffer())
  if (!signature.every((expected, index) => bytes[index] === expected)) {
    throw new SecurityError('INVALID_FILE', 400, 'Identity document signature is invalid')
  }
  return file
}
