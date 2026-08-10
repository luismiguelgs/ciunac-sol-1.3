import { z } from 'zod'
import {
  LocationCargoResponseDto,
  LocationCreateCommandDto,
  LocationCreateResponseDto,
  LocationDuplicateResponseDto,
  LocationLanguageResponseDto,
  LocationRequestDto,
  LocationScheduleResponseDto,
  LocationStudentLookupResponseDto,
  LocationStudentRequestDto,
  LocationStudentResponseDto,
  LocationTextResponseDto,
  LocationTypeResponseDto,
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

export const locationProfileCommandSchema = z.object({ isCiunacStudent: z.boolean() }).strict()

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

export const locationStudentResponseSchema: z.ZodType<LocationStudentResponseDto> = z.object({
  id: stringId,
}).passthrough()

export const locationStudentLookupResponseSchema: z.ZodType<LocationStudentLookupResponseDto> = z.object({
  id: stringId,
  nombres: z.string().trim().min(1),
  apellidos: z.string().trim().min(1),
  celular: z.string().trim().regex(/^\d{9}$/),
}).passthrough()

export const locationCreateResponseSchema: z.ZodType<LocationCreateResponseDto> = z.object({
  id: stringId,
}).passthrough()

export const locationDuplicateResponseArraySchema: z.ZodType<LocationDuplicateResponseDto[]> = z.array(z.object({
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

export const locationTypeArraySchema: z.ZodType<LocationTypeResponseDto[]> = z.array(z.object({
  id: z.union([z.literal(7), z.literal('7').transform(() => 7 as const)]),
  solicitud: z.string().trim().min(1),
  precio: amount,
}).passthrough()).length(1)

export const locationLanguageArraySchema: z.ZodType<LocationLanguageResponseDto[]> = z.array(z.object({
  id: numericId,
  nombre: z.string().trim().min(1),
}).passthrough()).min(1)

export const locationTextArraySchema: z.ZodType<LocationTextResponseDto[]> = z.array(z.object({
  codigo: z.string().trim().min(1),
  contenido: z.string().trim().min(1),
}).passthrough()).min(1)

export const locationScheduleArraySchema: z.ZodType<LocationScheduleResponseDto[]> = z.array(z.object({
  id: numericId,
  moduloId: numericId,
  fecha: z.string().datetime(),
  activo: z.boolean(),
  modulo: z.object({
    id: numericId,
    nombre: z.string().trim().min(1),
  }).passthrough(),
}).passthrough())

export const locationCargoResponseSchema: z.ZodType<LocationCargoResponseDto> = z.object({
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
