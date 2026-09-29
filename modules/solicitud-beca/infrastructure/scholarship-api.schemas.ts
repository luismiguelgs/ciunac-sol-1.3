import { z } from 'zod'

const numericId = z.union([
  z.number().int().positive(),
  z.string().trim().regex(/^\d+$/).transform(Number),
])
const shortText = z.string().trim().max(254)
const documentReference = z.string().trim().min(1).max(2048).refine(
  (value) => value.startsWith('/') || /^https?:\/\//i.test(value),
)

export const scholarshipRequestDtoSchema = z.object({
  nombres: shortText.min(1),
  apellidos: shortText.min(1),
  telefono: z.string().trim().regex(/^\d{9}$/),
  tipo_documento: z.enum(['DNI', 'CE', 'PASAPORTE']),
  numero_documento: z.string().trim().regex(/^[A-Za-z0-9]{8,9}$/),
  facultad: shortText.min(1),
  facultadId: z.string().trim().regex(/^[1-9]\d*$/),
  escuela: shortText.min(1),
  escuelaId: z.string().trim().regex(/^[1-9]\d*$/),
  codigo: shortText.min(1),
  direccion: z.string().trim().max(500),
  email: z.string().email().max(254),
  periodo: shortText.min(1),
  carta_de_compromiso: documentReference,
  historial_academico: documentReference,
  constancia_matricula: documentReference,
  contancia_tercio: documentReference,
  declaracion_jurada: documentReference,
}).strict().superRefine((data, context) => {
  const expectedLength = data.tipo_documento === 'DNI' ? 8 : 9
  if (data.numero_documento.length !== expectedLength) {
    context.addIssue({ code: 'custom', path: ['numero_documento'], message: 'Invalid document length' })
  }
})

export const scholarshipCreateResponseSchema = z.object({
  _id: z.string().trim().min(1).max(80).optional(),
  id: z.string().trim().min(1).max(80).optional(),
}).passthrough().refine((value) => Boolean(value._id || value.id), {
  message: 'La respuesta no contiene un identificador de beca.',
})

export const scholarshipFacultyArraySchema = z.array(
  z.object({
    id: numericId,
    nombre: z.string().trim().min(1).max(254),
    codigo: z.string().trim().min(1).max(80),
  }).passthrough(),
).min(1)

export const scholarshipSchoolArraySchema = z.array(
  z.object({
    id: numericId,
    nombre: z.string().trim().min(1).max(254),
    facultadId: numericId,
  }).passthrough(),
).min(1)

export type ScholarshipCreateResponseDto = z.output<typeof scholarshipCreateResponseSchema>
export type ScholarshipFacultyResponseDto = z.output<typeof scholarshipFacultyArraySchema>[number]
export type ScholarshipRequestDto = z.output<typeof scholarshipRequestDtoSchema>
export type ScholarshipSchoolResponseDto = z.output<typeof scholarshipSchoolArraySchema>[number]
