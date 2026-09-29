import { paymentRequestFields, validatePaymentRequest } from '@/modules/shared/infrastructure/api/payment-fields'
import { z } from 'zod'

const stringId = z.union([
  z.string().trim().min(1).refine((value) => !/^\d+$/.test(value) || Number(value) > 0),
  z.number().int().positive(),
]).transform(String)
const numericId = z.union([
  z.number().int().positive(),
  z.string().trim().regex(/^[1-9]\d*$/).transform(Number),
])
const amount = z.union([
  z.number().nonnegative(),
  z.string().trim().min(1).transform(Number),
]).refine((value) => Number.isFinite(value) && value >= 0)
const constanciaTypeId = z.union([z.literal(5), z.literal(6)])
const constanciaLevelId = z.union([z.literal(1), z.literal(2), z.literal(3)])

export const constanciaStudentResponseSchema = z.object({ id: stringId }).passthrough()

export const constanciaStudentLookupResponseSchema = z.object({
  id: stringId,
  nombres: z.string().trim().min(1),
  apellidos: z.string().trim().min(1),
  celular: z.string().trim().regex(/^\d{9}$/),
}).passthrough()

export const constanciaCreateResponseSchema = z.object({ id: stringId }).passthrough()

export const constanciaRequestDtoSchema = z.object({
  estudianteId: z.string().trim().min(1).max(80),
  tipoSolicitudId: constanciaTypeId,
  idiomaId: z.number().int().positive(),
  nivelId: constanciaLevelId,
  estadoId: z.number().int().positive(),
  periodo: z.string().trim().min(1).max(80),
  alumnoCiunac: z.boolean(),
  ...paymentRequestFields,
  digital: z.literal(true),
}).strict().superRefine(validatePaymentRequest)

export const constanciaTypeArraySchema = z.preprocess(
  filterConstanciaTypes,
  z.array(z.object({
    id: numericId.pipe(constanciaTypeId),
    solicitud: z.string().trim().min(1),
    precio: amount,
  }).passthrough()).min(1),
)

export const constanciaLanguageArraySchema = z.array(z.object({
  id: numericId,
  nombre: z.string().trim().min(1),
}).passthrough()).min(1)

export const constanciaFacultyArraySchema = z.array(z.object({
  id: numericId,
  nombre: z.string().trim().min(1),
  codigo: z.string().trim().min(1),
}).passthrough()).min(1)

export const constanciaSchoolArraySchema = z.array(z.object({
  id: numericId,
  nombre: z.string().trim().min(1),
  facultadId: numericId,
}).passthrough()).min(1)

export const constanciaTextArraySchema = z.array(z.object({
  codigo: z.string().trim().min(1),
  contenido: z.string().trim().min(1),
}).passthrough()).min(1)

export const constanciaCargoResponseSchema = z.object({
  id: numericId,
  creadoEn: z.string().trim().min(1),
  pago: amount,
  numeroVoucher: z.string().nullable().optional().transform((value) => value ?? null),
  fechaPago: z.string().trim().min(1).nullable().optional().transform((value) => value ?? null),
  estudiante: z.object({
    nombres: z.string().trim().min(1),
    apellidos: z.string().trim().min(1),
    numeroDocumento: z.string().trim().min(1),
  }).passthrough(),
  tiposSolicitud: z.object({
    id: constanciaTypeId,
    solicitud: z.string().trim().min(1),
  }).passthrough(),
  idioma: z.object({ nombre: z.string().trim().min(1) }).passthrough(),
  nivel: z.object({ nombre: z.string().trim().min(1) }).passthrough(),
}).passthrough()

export type ConstanciaRequestDto = z.output<typeof constanciaRequestDtoSchema>
export type ConstanciaStudentLookupResponseDto = z.output<typeof constanciaStudentLookupResponseSchema>
export type ConstanciaTypeResponseDto = z.output<typeof constanciaTypeArraySchema>[number]
export type ConstanciaLanguageResponseDto = z.output<typeof constanciaLanguageArraySchema>[number]
export type ConstanciaFacultyResponseDto = z.output<typeof constanciaFacultyArraySchema>[number]
export type ConstanciaSchoolResponseDto = z.output<typeof constanciaSchoolArraySchema>[number]
export type ConstanciaTextResponseDto = z.output<typeof constanciaTextArraySchema>[number]
export type ConstanciaCargoResponseDto = z.output<typeof constanciaCargoResponseSchema>

function filterConstanciaTypes(value: unknown): unknown {
  if (!Array.isArray(value)) return value
  return value.filter((item) => {
    if (!item || typeof item !== 'object') return false
    const id = Number((item as { id?: unknown }).id)
    return id === 5 || id === 6
  })
}
