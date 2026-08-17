import { z } from 'zod'
import type { CertificateRequestDto } from '@/modules/solicitud-certificado/infrastructure/dto/certificate-request.dto'

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
const certificateTypeId = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
const documentReference = z.string().trim().min(1).max(2048).refine(
  (value) => value.startsWith('/') || /^https?:\/\//i.test(value),
)

export const certificateStudentResponseSchema = z.object({
  id: stringId,
}).passthrough()

export const certificateStudentLookupResponseSchema = z.object({
  id: stringId,
  nombres: z.string().trim().min(1),
  apellidos: z.string().trim().min(1),
  celular: z.string().trim().regex(/^\d{9}$/),
}).passthrough()

export const certificateCreateResponseSchema = z.object({
  id: stringId,
}).passthrough()

export const certificateRequestDtoSchema: z.ZodType<CertificateRequestDto> = z.object({
  estudianteId: z.string().trim().min(1).max(80),
  tipoSolicitudId: certificateTypeId,
  idiomaId: z.number().int().positive(),
  nivelId: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  estadoId: z.number().int().positive(),
  periodo: z.string().trim().min(1).max(80),
  alumnoCiunac: z.boolean(),
  fechaPago: z.string().datetime().optional(),
  pago: z.number().nonnegative(),
  digital: z.boolean(),
  numeroVoucher: z.string().regex(/^\d{15}$/).optional(),
  imgVoucher: documentReference.optional(),
}).strict().superRefine((data, context) => {
  if (data.pago <= 0) return
  if (!data.fechaPago) context.addIssue({ code: 'custom', path: ['fechaPago'], message: 'Payment date is required' })
  if (!data.numeroVoucher) context.addIssue({ code: 'custom', path: ['numeroVoucher'], message: 'Voucher number is required' })
  if (!data.imgVoucher) context.addIssue({ code: 'custom', path: ['imgVoucher'], message: 'Voucher file is required' })
})

export const certificateTypeArraySchema = z.preprocess(
  filterCertificateTypes,
  z.array(z.object({
    id: numericId.pipe(certificateTypeId),
    solicitud: z.string().trim().min(1),
    precio: amount,
  }).passthrough()).min(1),
)

export const certificateLanguageArraySchema = z.array(z.object({
  id: numericId,
  nombre: z.string().trim().min(1),
}).passthrough()).min(1)

export const certificateFacultyArraySchema = z.array(z.object({
  id: numericId,
  nombre: z.string().trim().min(1),
  codigo: z.string().trim().min(1),
}).passthrough()).min(1)

export const certificateSchoolArraySchema = z.array(z.object({
  id: numericId,
  nombre: z.string().trim().min(1),
  facultadId: numericId,
}).passthrough()).min(1)

export const certificateTextArraySchema = z.array(z.object({
  codigo: z.string().trim().min(1),
  contenido: z.string().trim().min(1),
}).passthrough()).min(1)

export const certificateCargoResponseSchema = z.object({
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
  tiposSolicitud: z.object({
    id: certificateTypeId,
    solicitud: z.string().trim().min(1),
  }).passthrough(),
  idioma: z.object({ nombre: z.string().trim().min(1) }).passthrough(),
  nivel: z.object({ nombre: z.string().trim().min(1) }).passthrough(),
}).passthrough()

export type CertificateStudentResponseDto = z.output<typeof certificateStudentResponseSchema>
export type CertificateStudentLookupResponseDto = z.output<typeof certificateStudentLookupResponseSchema>
export type CertificateCreateResponseDto = z.output<typeof certificateCreateResponseSchema>
export type CertificateTypeResponseDto = z.output<typeof certificateTypeArraySchema>[number]
export type CertificateLanguageResponseDto = z.output<typeof certificateLanguageArraySchema>[number]
export type CertificateFacultyResponseDto = z.output<typeof certificateFacultyArraySchema>[number]
export type CertificateSchoolResponseDto = z.output<typeof certificateSchoolArraySchema>[number]
export type CertificateTextResponseDto = z.output<typeof certificateTextArraySchema>[number]
export type CertificateCargoResponseDto = z.output<typeof certificateCargoResponseSchema>

function filterCertificateTypes(value: unknown): unknown {
  if (!Array.isArray(value)) return value
  return value.filter((item) => {
    if (!item || typeof item !== 'object') return false
    const id = Number((item as { id?: unknown }).id)
    return id >= 1 && id <= 4
  })
}
