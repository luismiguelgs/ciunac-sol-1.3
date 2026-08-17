import {
  getScholarshipDocumentViolation,
  type ScholarshipDocumentViolation,
} from '@/modules/solicitud-beca/domain/scholarship-document-policy'

const violationMessages: Record<ScholarshipDocumentViolation, string> = {
  EMPTY: 'El archivo está vacío.',
  TOO_LARGE: 'El archivo supera el límite de 8 MB.',
  INVALID_MIME: 'Solo se permiten archivos PDF.',
  INVALID_EXTENSION: 'La extensión del archivo no coincide con el formato PDF.',
}

export function validateScholarshipDocumentForPresentation(
  file: Pick<File, 'name' | 'size' | 'type'>,
): string | null {
  const violation = getScholarshipDocumentViolation({
    name: file.name,
    size: file.size,
    mimeType: file.type,
  })
  return violation ? violationMessages[violation] : null
}
