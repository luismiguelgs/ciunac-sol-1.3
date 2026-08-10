import 'server-only'

import {
  MAX_VOUCHER_FILE_BYTES,
  VoucherMimeType,
  validateVoucherFileMetadata,
} from '@/modules/shared/domain/voucher-file-policy'
import { SecurityError } from '@/modules/security/server/security-error'

const FILE_SIGNATURES: Record<VoucherMimeType, readonly number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46, 0x2d],
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  'image/jpeg': [0xff, 0xd8, 0xff],
}

export async function validateVoucherUpload(formData: FormData): Promise<File> {
  const file = formData.get('file')
  if (!(file instanceof File)) {
    throw new SecurityError('INVALID_FILE', 400, 'Voucher file is missing')
  }

  const metadataError = validateVoucherFileMetadata(file)
  if (metadataError) {
    const status = file.size > MAX_VOUCHER_FILE_BYTES ? 413 : 400
    throw new SecurityError('INVALID_FILE', status, metadataError)
  }

  const signature = FILE_SIGNATURES[file.type as VoucherMimeType]
  const bytes = new Uint8Array(await file.slice(0, signature.length).arrayBuffer())
  const signatureMatches = signature.every((expected, index) => bytes[index] === expected)
  if (!signatureMatches) {
    throw new SecurityError('INVALID_FILE', 400, 'Voucher signature does not match its MIME type')
  }

  return file
}
