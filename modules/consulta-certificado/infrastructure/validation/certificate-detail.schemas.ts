import { z } from 'zod'

const externalIdSchema = z.union([
  z.string().trim().min(1),
  z.number().finite(),
]).transform(String)

const nonNegativeIntegerSchema = z.union([
  z.number(),
  z.string().regex(/^\d+$/),
]).transform(Number).pipe(z.number().int().nonnegative())

const positiveIntegerSchema = z.union([
  z.number(),
  z.string().regex(/^\d+$/),
]).transform(Number).pipe(z.number().int().positive())

const externalDateSchema = z.string().trim().min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Fecha externa no valida')
  .transform((value) => new Date(value).toISOString())

const nullableExternalDateSchema = z.union([z.string(), z.null(), z.undefined()])
  .transform((value) => typeof value === 'string' && value.trim() ? value.trim() : null)
  .refine((value) => value === null || !Number.isNaN(Date.parse(value)), 'Fecha externa no valida')
  .transform((value) => value === null ? null : new Date(value).toISOString())

export const certificateNoteResponseSchema = z.object({
  ciclo: z.string().trim().min(1),
  periodo: z.string().trim().optional().default(''),
  modalidad: z.string().trim().optional().default(''),
  nota: z.number().finite(),
}).passthrough()

export const certificateDetailResponseSchema = z.object({
  _id: externalIdSchema,
  tipo: z.enum(['VIRTUAL', 'FISICO']),
  estudiante: z.string().trim().min(1),
  idioma: z.string().trim().min(1),
  nivel: z.string().trim().min(1),
  cantidadHoras: nonNegativeIntegerSchema,
  solicitudId: positiveIntegerSchema,
  fechaEmision: externalDateSchema,
  numeroRegistro: z.string().trim().min(1),
  fechaConcluido: externalDateSchema,
  aceptado: z.boolean().nullish().transform(Boolean),
  fechaAceptacion: nullableExternalDateSchema,
  notas: z.array(certificateNoteResponseSchema).optional().default([]),
}).passthrough().superRefine((value, context) => {
  if (value.aceptado && value.fechaAceptacion === null) {
    context.addIssue({
      code: 'custom',
      path: ['fechaAceptacion'],
      message: 'Un certificado aceptado requiere fecha de aceptacion',
    })
  }
})

export type CertificateDetailResponseDto = z.output<typeof certificateDetailResponseSchema>
