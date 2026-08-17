import { z } from 'zod'

const documentReference = z.string().trim().min(1, 'Documento requerido').max(2048).refine(
  (value) => value.startsWith('/') || /^https?:\/\//i.test(value),
  'La referencia del documento no es válida',
)

export const documentsSchema = z.object({
  constancia_matricula: documentReference,
  historial_academico: documentReference,
  constancia_tercio: documentReference,
  carta_compromiso: documentReference,
  declaracion_jurada: documentReference,
}).strict()

export type DocumentsFormValues = z.infer<typeof documentsSchema>
