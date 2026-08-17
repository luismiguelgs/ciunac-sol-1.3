import { z } from 'zod'

const numericId = z.union([
  z.number().int().positive(),
  z.string().trim().regex(/^\d+$/).transform(Number),
])

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
export type ScholarshipSchoolResponseDto = z.output<typeof scholarshipSchoolArraySchema>[number]
