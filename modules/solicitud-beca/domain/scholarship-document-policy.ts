export const MAX_SCHOLARSHIP_DOCUMENT_BYTES = 8 * 1024 * 1024
export const SCHOLARSHIP_DOCUMENT_MIME = 'application/pdf'

type FileMetadata = Pick<File, 'name' | 'size' | 'type'>

export function validateScholarshipDocumentMetadata(file: FileMetadata): string | null {
  if (file.size <= 0) return 'El archivo está vacío.'
  if (file.size > MAX_SCHOLARSHIP_DOCUMENT_BYTES) return 'El archivo supera el límite de 8 MB.'
  if (file.type !== SCHOLARSHIP_DOCUMENT_MIME) return 'Solo se permiten archivos PDF.'
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return 'La extensión del archivo no coincide con el formato PDF.'
  }
  return null
}
