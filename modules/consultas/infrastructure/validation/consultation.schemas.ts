import { z } from 'zod'
import {
  ConsultationTextResponseDto,
  ConsultedRequestResponseDto,
} from '@/modules/consultas/infrastructure/dto/consultation.dto'

const positiveNumber = z.union([
  z.number().int().positive(),
  z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()),
])
const stringId = z.union([
  z.string().trim().min(1),
  z.number().int().positive().transform(String),
])
const amount = z.union([
  z.number().nonnegative(),
  z.string().trim().min(1).transform(Number),
]).refine((value) => Number.isFinite(value) && value >= 0)
const dateString = z.string().trim().min(1).refine((value) => !Number.isNaN(Date.parse(value)))
const optionalDateString = z.union([dateString, z.literal('').transform(() => null), z.null()])
  .optional()
  .transform((value) => value ?? null)
const optionalText = z.string().trim().nullable().optional().transform((value) => value || null)

const consultedRequestResponseSchema: z.ZodType<ConsultedRequestResponseDto> = z.object({
  id: positiveNumber,
  tipoSolicitudId: positiveNumber,
  estadoId: positiveNumber,
  creadoEn: dateString,
  pago: amount,
  numeroVoucher: optionalText,
  fechaPago: optionalDateString,
  digital: z.boolean(),
  observaciones: z.string().nullable().optional().transform((value) => value?.trim() || null),
  estudiante: z.object({
    id: stringId,
    nombres: z.string().trim().min(1),
    apellidos: z.string().trim().min(1),
    numeroDocumento: z.string().trim().min(8).max(12),
  }).passthrough(),
  tiposSolicitud: z.object({
    id: positiveNumber,
    solicitud: z.string().trim().min(1),
  }).passthrough(),
  idioma: z.object({
    id: positiveNumber,
    nombre: z.string().trim().min(1),
  }).passthrough(),
  nivel: z.object({
    id: positiveNumber,
    nombre: z.string().trim().min(1),
  }).passthrough(),
  estado: z.object({
    id: positiveNumber,
    nombre: z.string().trim().min(1),
    referencia: z.string().trim().default(''),
  }).passthrough(),
}).passthrough().refine(
  (value) => value.tipoSolicitudId === value.tiposSolicitud.id && value.estadoId === value.estado.id,
  { message: 'Inconsistent nested identifiers' },
)

export const consultedRequestArrayResponseSchema = z.array(consultedRequestResponseSchema)

export const consultationTextArrayResponseSchema: z.ZodType<ConsultationTextResponseDto[]> = z.array(
  z.object({
    codigo: z.string().trim().min(1),
    contenido: z.string(),
  }).passthrough(),
)

export const consultationCheckResponseSchema = z.object({
  ok: z.literal(true),
  found: z.boolean(),
}).strict()
