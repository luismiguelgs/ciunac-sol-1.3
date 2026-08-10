import { z } from 'zod'
import {
  ScholarshipCreateResponseDto,
  ScholarshipFacultyResponseDto,
  ScholarshipSchoolResponseDto,
} from '@/modules/solicitud-beca/infrastructure/dto/scholarship-api.dto'

const numericId = z.union([
  z.number().int().positive(),
  z.string().trim().regex(/^\d+$/).transform(Number),
])

export const scholarshipCreateResponseSchema: z.ZodType<ScholarshipCreateResponseDto> = z.object({
  _id: z.string().trim().min(1).max(80).optional(),
  id: z.string().trim().min(1).max(80).optional(),
}).passthrough().refine((value) => Boolean(value._id || value.id), {
  message: 'La respuesta no contiene un identificador de beca.',
})

export const scholarshipFacultyArraySchema: z.ZodType<ScholarshipFacultyResponseDto[]> = z.array(
  z.object({
    id: numericId,
    nombre: z.string().trim().min(1).max(254),
    codigo: z.string().trim().min(1).max(80),
  }).passthrough(),
).min(1)

export const scholarshipSchoolArraySchema: z.ZodType<ScholarshipSchoolResponseDto[]> = z.array(
  z.object({
    id: numericId,
    nombre: z.string().trim().min(1).max(254),
    facultadId: numericId,
  }).passthrough(),
).min(1)
