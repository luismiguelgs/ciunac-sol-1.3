import { z } from 'zod'
import {
  LocationCreateCommandDto,
  LocationRequestDto,
  LocationStudentRequestDto,
} from '@/modules/solicitud-ubicacion/infrastructure/dto/location-api.dto'

const stringId = z.union([z.string().trim().min(1), z.number().int().positive()]).transform(String)
const numericId = z.union([
  z.number().int().positive(),
  z.string().trim().regex(/^[1-9]\d*$/).transform(Number),
])
const amount = z.union([
  z.number().nonnegative(),
  z.string().trim().min(1).transform(Number),
]).refine((value) => Number.isFinite(value) && value >= 0)
const documentReference = z.string().trim().min(1).max(2048).refine(
  (value) => value.startsWith('/') || /^https?:\/\//i.test(value),
)

export const locationStudentRequestDtoSchema: z.ZodType<LocationStudentRequestDto> = z.object({
  nombres: z.string().trim().min(1).max(254),
  apellidos: z.string().trim().min(1).max(254),
  tipoDocumento: z.enum(['DNI', 'CE', 'PASAPORTE']),
  numeroDocumento: z.string().trim().regex(/^[A-Za-z0-9]{8,9}$/),
  celular: z.string().trim().regex(/^\d{9}$/),
  email: z.string().trim().email().max(254),
  imgDoc: documentReference,
}).strict().superRefine((data, context) => {
  const expectedLength = data.tipoDocumento === 'DNI' ? 8 : 9
  if (data.numeroDocumento.length !== expectedLength) {
    context.addIssue({ code: 'custom', path: ['numeroDocumento'], message: 'Invalid document length' })
  }
})

export const locationStudentResponseSchema = z.object({
  id: stringId,
}).passthrough()

export const locationStudentLookupResponseSchema = z.object({
  id: stringId,
  nombres: z.string().trim().min(1),
  apellidos: z.string().trim().min(1),
  celular: z.string().trim().regex(/^\d{9}$/),
}).passthrough()

export const locationCreateResponseSchema = z.object({
  id: stringId,
}).passthrough()

export const locationDuplicateResponseArraySchema = z.array(z.object({
  estadoId: z.number().int().positive(),
  idiomaId: z.number().int().positive(),
  tipoSolicitudId: z.number().int().positive(),
}).passthrough())

export const locationRequestDtoSchema: z.ZodType<LocationRequestDto> = z.object({
  estudianteId: z.string().trim().min(1).max(80),
  tipoSolicitudId: z.literal(7),
  idiomaId: z.number().int().positive(),
  nivelId: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  estadoId: z.number().int().positive(),
  periodo: z.string().trim().min(1).max(80),
  alumnoCiunac: z.boolean(),
  fechaPago: z.string().datetime().optional(),
  pago: z.number().nonnegative(),
  digital: z.literal(false),
  numeroVoucher: z.string().regex(/^\d{15}$/).optional(),
  imgCertEstudio: documentReference.optional(),
  imgVoucher: documentReference.optional(),
}).strict().superRefine((data, context) => {
  if (data.pago > 0) {
    if (!data.fechaPago) context.addIssue({ code: 'custom', path: ['fechaPago'], message: 'Payment date is required' })
    if (!data.numeroVoucher) context.addIssue({ code: 'custom', path: ['numeroVoucher'], message: 'Voucher number is required' })
    if (!data.imgVoucher) context.addIssue({ code: 'custom', path: ['imgVoucher'], message: 'Voucher file is required' })
  }
  if (data.alumnoCiunac && !data.imgCertEstudio) {
    context.addIssue({ code: 'custom', path: ['imgCertEstudio'], message: 'Study certificate is required' })
  }
  if (!data.alumnoCiunac && data.imgCertEstudio) {
    context.addIssue({ code: 'custom', path: ['imgCertEstudio'], message: 'Study certificate is not allowed' })
  }
})

export const locationCreateCommandDtoSchema: z.ZodType<LocationCreateCommandDto> = z.object({
  documentNumber: z.string().trim().regex(/^[A-Za-z0-9]{8,9}$/),
  request: locationRequestDtoSchema,
}).strict()

export const locationTypeArraySchema = z.array(z.object({
  id: z.union([z.literal(7), z.literal('7').transform(() => 7 as const)]),
  solicitud: z.string().trim().min(1),
  precio: amount,
}).passthrough()).length(1)

export const locationLanguageArraySchema = z.array(z.object({
  id: numericId,
  nombre: z.string().trim().min(1),
}).passthrough()).min(1)

export const locationTextArraySchema = z.array(z.object({
  codigo: z.string().trim().min(1),
  contenido: z.string().trim().min(1),
}).passthrough()).min(1)

export const locationScheduleArraySchema = z.array(z.object({
  id: numericId,
  moduloId: numericId,
  fecha: z.string().datetime(),
  activo: z.boolean(),
  modulo: z.object({
    id: numericId,
    nombre: z.string().trim().min(1),
  }).passthrough(),
}).passthrough())

export const locationCargoResponseSchema = z.object({
  id: numericId,
  creadoEn: z.string().trim().min(1),
  pago: amount,
  numeroVoucher: z.string().trim().min(1).nullable().optional().transform((value) => value ?? null),
  fechaPago: z.string().trim().min(1).nullable().optional().transform((value) => value ?? null),
  estudiante: z.object({
    nombres: z.string().trim().min(1),
    apellidos: z.string().trim().min(1),
    numeroDocumento: z.string().trim().min(1),
  }).passthrough(),
  tiposSolicitud: z.object({ id: z.literal(7), solicitud: z.string().trim().min(1) }).passthrough(),
  idioma: z.object({ nombre: z.string().trim().min(1) }).passthrough(),
  nivel: z.object({ nombre: z.string().trim().min(1) }).passthrough(),
}).passthrough()

export function filterLocationTypeResponse(value: unknown): unknown {
  if (!Array.isArray(value)) return value
  return value.filter(
    (item) => item && typeof item === 'object' && Number((item as { id?: unknown }).id) === 7,
  )
}

export type LocationStudentResponseDto = z.output<typeof locationStudentResponseSchema>
export type LocationStudentLookupResponseDto = z.output<typeof locationStudentLookupResponseSchema>
export type LocationCreateResponseDto = z.output<typeof locationCreateResponseSchema>
export type LocationDuplicateResponseDto = z.output<typeof locationDuplicateResponseArraySchema>[number]
export type LocationTypeResponseDto = z.output<typeof locationTypeArraySchema>[number]
export type LocationLanguageResponseDto = z.output<typeof locationLanguageArraySchema>[number]
export type LocationTextResponseDto = z.output<typeof locationTextArraySchema>[number]
export type LocationScheduleResponseDto = z.output<typeof locationScheduleArraySchema>[number]
export type LocationCargoResponseDto = z.output<typeof locationCargoResponseSchema>
