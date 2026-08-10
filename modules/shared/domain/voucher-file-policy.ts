export const MAX_VOUCHER_FILE_BYTES = 8 * 1024 * 1024

export const VOUCHER_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
} as const

export type VoucherMimeType = keyof typeof VOUCHER_FILE_TYPES

export function validateVoucherFileMetadata(file: Pick<File, 'name' | 'size' | 'type'>): string | null {
  if (file.size <= 0) return 'El archivo esta vacio.'
  if (file.size > MAX_VOUCHER_FILE_BYTES) return 'El archivo supera el limite de 8 MB.'
  if (!isVoucherMimeType(file.type)) return 'Solo se permiten archivos PDF, JPG y PNG.'

  const extension = getExtension(file.name)
  if (!VOUCHER_FILE_TYPES[file.type].includes(extension as never)) {
    return 'La extension del archivo no coincide con su formato.'
  }

  return null
}

export function isVoucherMimeType(value: string): value is VoucherMimeType {
  return Object.hasOwn(VOUCHER_FILE_TYPES, value)
}

function getExtension(fileName: string): string {
  const separator = fileName.lastIndexOf('.')
  return separator >= 0 ? fileName.slice(separator).toLowerCase() : ''
}
