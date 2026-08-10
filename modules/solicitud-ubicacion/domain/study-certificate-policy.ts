export const MAX_LOCATION_STUDY_CERTIFICATE_BYTES = 8 * 1024 * 1024

export function validateLocationStudyCertificateMetadata(
  file: Pick<File, 'name' | 'size' | 'type'>,
): string | null {
  if (file.size <= 0) return 'El archivo esta vacio.'
  if (file.size > MAX_LOCATION_STUDY_CERTIFICATE_BYTES) return 'El archivo supera el limite de 8 MB.'
  if (file.type !== 'application/pdf') return 'Solo se permiten archivos PDF.'
  if (!file.name.toLowerCase().endsWith('.pdf')) return 'La extension no coincide con el formato PDF.'
  return null
}

