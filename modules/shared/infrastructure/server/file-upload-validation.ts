import 'server-only'

import { SecurityError } from '@/modules/security/server/security-error'
import { getFileViolation, type FileMimeType, type FilePolicy } from '../../domain/file-validation'

const signatures: Record<FileMimeType, readonly number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46, 0x2d],
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  'image/jpeg': [0xff, 0xd8, 0xff],
}

export async function validateFileUpload(formData: FormData, policy: FilePolicy): Promise<File> {
  const file = formData.get('file')
  if (!(file instanceof File)) throw new SecurityError('INVALID_FILE', 400, 'File is missing')

  const violation = getFileViolation({ name: file.name, size: file.size, mimeType: file.type }, policy)
  if (violation) {
    throw new SecurityError('INVALID_FILE', violation === 'TOO_LARGE' ? 413 : 400, `Invalid file: ${violation}`)
  }

  const mimeType = policy.allowedMimeTypes.find((type) => type === file.type)
  if (!mimeType) throw new SecurityError('INVALID_FILE', 400, 'Unsupported file type')
  const signature = signatures[mimeType]
  const bytes = new Uint8Array(await file.slice(0, signature.length).arrayBuffer())
  if (!signature.every((expected, index) => bytes[index] === expected)) {
    throw new SecurityError('INVALID_FILE', 400, 'File signature does not match its MIME type')
  }
  return file
}
