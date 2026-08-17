import { z } from 'zod'

const externalIdSchema = z.union([
  z.number(),
  z.string().regex(/^\d+$/),
]).transform(Number).pipe(z.number().int().positive())

const externalStringIdSchema = z.union([
  z.string().trim().min(1),
  z.number().finite(),
]).transform(String)

const externalDateSchema = z.string().trim().min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Fecha externa no valida')
  .transform((value) => new Date(value).toISOString())

export const locationExamArrayResponseSchema = z.array(z.object({
  id: externalIdSchema,
  fecha: externalDateSchema,
}).passthrough())

export const locationCycleArrayResponseSchema = z.array(z.object({
  id: externalIdSchema,
  nombre: z.string().trim().min(1),
}).passthrough())

export const locationPlacementArrayResponseSchema = z.array(z.object({
  id: externalIdSchema,
  examenId: externalIdSchema,
  solicitudId: externalIdSchema,
  nota: z.number().finite().min(0).max(100),
  terminado: z.boolean(),
  estudiante: z.object({
    id: externalStringIdSchema,
    nombres: z.string().trim().min(1),
    apellidos: z.string().trim().min(1),
    numeroDocumento: z.string().trim().min(8).max(20),
  }).passthrough().nullish().transform((value) => value ?? null),
  idioma: z.object({
    id: externalIdSchema,
    nombre: z.string().trim().min(1),
  }).passthrough(),
  nivel: z.object({
    id: externalIdSchema,
    nombre: z.string().trim().min(1),
  }).passthrough(),
  calificacion: z.object({ cicloId: externalIdSchema }).passthrough().nullish().transform((value) => value ?? null),
}).passthrough())

export type LocationExamResponseDto = z.output<typeof locationExamArrayResponseSchema>[number]
export type LocationCycleResponseDto = z.output<typeof locationCycleArrayResponseSchema>[number]
export type LocationPlacementResponseDto = z.output<typeof locationPlacementArrayResponseSchema>[number]
