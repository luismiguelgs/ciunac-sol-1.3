import {
  MAX_VOUCHER_FILE_BYTES,
  VOUCHER_FILE_TYPES,
  VoucherMimeType,
  isVoucherMimeType,
  validateVoucherFileMetadata,
} from '@/modules/shared/domain/voucher-file-policy'

export const MAX_IDENTITY_DOCUMENT_BYTES = MAX_VOUCHER_FILE_BYTES
export const IDENTITY_DOCUMENT_FILE_TYPES = VOUCHER_FILE_TYPES
export type IdentityDocumentMimeType = VoucherMimeType

export function validateIdentityDocumentMetadata(file: Pick<File, 'name' | 'size' | 'type'>): string | null {
  return validateVoucherFileMetadata(file)
}

export function isIdentityDocumentMimeType(value: string): value is IdentityDocumentMimeType {
  return isVoucherMimeType(value)
}

