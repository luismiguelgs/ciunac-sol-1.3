import 'server-only'

import { SecurityError } from '@/modules/security/server/security-error'
import {
  MAX_LOCATION_DOCUMENT_BYTES,
  getIdentityDocumentViolation,
  getStudyCertificateViolation,
  type LocationDocumentViolation,
  type LocationIdentityDocumentMimeType,
} from '@/modules/solicitud-ubicacion/domain/location-document-policy'

const IDENTITY_SIGNATURES: Record<LocationIdentityDocumentMimeType, readonly number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46, 0x2d],
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  'image/jpeg': [0xff, 0xd8, 0xff],
}
const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d]

export async function validateIdentityDocumentUpload(formData: FormData): Promise<File> {
  const file = requireFile(formData, 'Identity document is missing')
  const violation = getIdentityDocumentViolation(toMetadata(file))
  if (violation) throwInvalidMetadata(violation, 'Identity document metadata is invalid')

  const signature = IDENTITY_SIGNATURES[file.type as LocationIdentityDocumentMimeType]
  await assertSignature(file, signature, 'Identity document signature is invalid')
  return file
}

export async function validateLocationStudyCertificateUpload(formData: FormData): Promise<File> {
  const file = requireFile(formData, 'Location study certificate is missing')
  const violation = getStudyCertificateViolation(toMetadata(file))
  if (violation) throwInvalidMetadata(violation, 'Location study certificate metadata is invalid')

  await assertSignature(file, PDF_SIGNATURE, 'Location study certificate signature is invalid')
  return file
}

function requireFile(formData: FormData, message: string): File {
  const file = formData.get('file')
  if (!(file instanceof File)) throw new SecurityError('INVALID_FILE', 400, message)
  return file
}

function toMetadata(file: File) {
  return { name: file.name, size: file.size, mimeType: file.type }
}

function throwInvalidMetadata(violation: LocationDocumentViolation, message: string): never {
  throw new SecurityError(
    'INVALID_FILE',
    violation === 'TOO_LARGE' ? 413 : 400,
    message,
  )
}

async function assertSignature(file: File, signature: readonly number[], message: string): Promise<void> {
  if (file.size > MAX_LOCATION_DOCUMENT_BYTES) {
    throw new SecurityError('INVALID_FILE', 413, 'Location document is too large')
  }
  const bytes = new Uint8Array(await file.slice(0, signature.length).arrayBuffer())
  if (!signature.every((expected, index) => bytes[index] === expected)) {
    throw new SecurityError('INVALID_FILE', 400, message)
  }
}
