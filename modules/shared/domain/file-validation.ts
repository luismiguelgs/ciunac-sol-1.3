export type FileMimeType = 'application/pdf' | 'image/jpeg' | 'image/png'

export type FileMetadata = { name: string; size: number; mimeType: string }
export type FilePolicy = { maxBytes: number; allowedMimeTypes: readonly FileMimeType[] }
export type FileViolation = 'EMPTY' | 'TOO_LARGE' | 'INVALID_MIME' | 'INVALID_EXTENSION'

const extensions: Record<FileMimeType, readonly string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
}

export function getFileViolation(file: FileMetadata, policy: FilePolicy): FileViolation | null {
  if (!Number.isFinite(file.size) || file.size <= 0) return 'EMPTY'
  if (file.size > policy.maxBytes) return 'TOO_LARGE'
  const mimeType = policy.allowedMimeTypes.find((type) => type === file.mimeType)
  if (!mimeType) return 'INVALID_MIME'
  const separator = file.name.lastIndexOf('.')
  const extension = separator >= 0 ? file.name.slice(separator).toLowerCase() : ''
  if (!extensions[mimeType].includes(extension)) return 'INVALID_EXTENSION'
  return null
}
