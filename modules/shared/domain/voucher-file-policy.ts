import { getFileViolation, type FilePolicy, type FileViolation } from './file-validation'

export const MAX_VOUCHER_FILE_BYTES = 8 * 1024 * 1024
export const voucherFilePolicy: FilePolicy = {
  maxBytes: MAX_VOUCHER_FILE_BYTES,
  allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
}

const messages: Record<FileViolation, string> = {
  EMPTY: 'El archivo esta vacio.',
  TOO_LARGE: 'El archivo supera el limite de 8 MB.',
  INVALID_MIME: 'Solo se permiten archivos PDF, JPG y PNG.',
  INVALID_EXTENSION: 'La extension del archivo no coincide con su formato.',
}

export function validateVoucherFileMetadata(file: { name: string; size: number; type: string }): string | null {
  const violation = getFileViolation({ name: file.name, size: file.size, mimeType: file.type }, voucherFilePolicy)
  return violation ? messages[violation] : null
}
