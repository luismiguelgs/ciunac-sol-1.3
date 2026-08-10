import { z } from 'zod'
import {
  ConstanciaCargoResponseDto,
  ConstanciaCreateResponseDto,
  ConstanciaStudentLookupResponseDto,
  ConstanciaStudentResponseDto,
  ConstanciaTypeCatalogResponseDto,
} from '@/modules/solicitud-constancia/infrastructure/dto/constancia-api.dto'

const stringId = z.union([
  z.string().trim().min(1).refine((value) => !/^\d+$/.test(value) || Number(value) > 0),
  z.number().int().positive(),
]).transform(String)
const numericId = z.union([
  z.number().int().positive(),
  z.string().regex(/^\d+$/).transform(Number),
])
const amount = z.union([
  z.number().nonnegative(),
  z.string().trim().min(1).transform(Number),
]).refine((value) => Number.isFinite(value) && value >= 0)

export const constanciaStudentResponseSchema: z.ZodType<ConstanciaStudentResponseDto> = z.object({
  id: stringId,
}).passthrough()

export const constanciaStudentLookupResponseSchema: z.ZodType<ConstanciaStudentLookupResponseDto> = z.object({
  id: stringId,
  nombres: z.string().trim().min(1),
  apellidos: z.string().trim().min(1),
  celular: z.string().trim().regex(/^\d{9}$/),
}).passthrough()

export const constanciaCreateResponseSchema: z.ZodType<ConstanciaCreateResponseDto> = z.object({
  id: stringId,
}).passthrough()

export const constanciaTypeCatalogResponseSchema: z.ZodType<ConstanciaTypeCatalogResponseDto[]> = z.array(
  z.object({
    id: numericId,
    solicitud: z.string().trim().min(1),
    precio: amount,
  }).passthrough(),
)

export const constanciaCargoResponseSchema: z.ZodType<ConstanciaCargoResponseDto> = z.object({
  id: numericId,
  creadoEn: z.string().min(1),
  pago: amount,
  numeroVoucher: z.string().nullable().optional().transform((value) => value ?? null),
  fechaPago: z.string().min(1).nullable().optional().transform((value) => value ?? null),
  estudiante: z.object({
    nombres: z.string().min(1),
    apellidos: z.string().min(1),
    numeroDocumento: z.string().min(1),
  }).passthrough(),
  tiposSolicitud: z.object({
    id: z.union([z.literal(5), z.literal(6)]),
    solicitud: z.string().min(1),
  }).passthrough(),
  idioma: z.object({ nombre: z.string().min(1) }).passthrough(),
  nivel: z.object({ nombre: z.string().min(1) }).passthrough(),
}).passthrough()
