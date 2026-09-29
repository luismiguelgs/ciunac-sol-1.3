import { z } from 'zod'

const positiveNumber = z.union([
  z.number().int().positive(),
  z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()),
])
const dateString = z.string().trim().min(1).refine((value) => !Number.isNaN(Date.parse(value)))
const documentNumber = z.union([
  z.string().trim(),
  z.number().int().nonnegative().transform(String),
]).pipe(z.string().min(8).max(12))
const safeDocumentUrl = z.string().url().refine((value) => {
  const protocol = new URL(value).protocol
  return protocol === 'http:' || protocol === 'https:'
})
const documentIdFields = {
  _id: z.union([z.string().trim().min(1), z.number().int().positive().transform(String)]).optional(),
  id: z.union([z.string().trim().min(1), z.number().int().positive().transform(String)]).optional(),
}

export const certificateDigitalDocumentResponseSchema = z.object({
  ...documentIdFields,
  solicitudId: positiveNumber,
  numeroDocumento: documentNumber,
  idioma: z.string().trim().min(1),
  nivel: z.string().trim().min(1).nullable().optional().transform((value) => value ?? null),
  url: safeDocumentUrl,
  aceptado: z.boolean(),
  fechaEmision: dateString.nullable().optional().transform((value) => value ?? null),
}).passthrough().refine((value) => Boolean(value._id || value.id), { message: 'Missing document id' })

export const constanciaDigitalDocumentResponseSchema = z.preprocess(
  normalizeConstanciaAliases,
  z.object({
    ...documentIdFields,
    solicitudId: positiveNumber,
    numeroDocumento: documentNumber,
    tipo: z.string().trim().min(1),
    nivel: z.string().trim().min(1).nullable().optional().transform((value) => value ?? null),
    url: safeDocumentUrl,
    aceptado: z.boolean(),
    fechaEmision: dateString.nullable().optional().transform((value) => value ?? null),
  }).passthrough().refine((value) => Boolean(value._id || value.id), { message: 'Missing document id' }),
)

export type CertificateDigitalDocumentResponseDto = z.output<
  typeof certificateDigitalDocumentResponseSchema
>
export type ConstanciaDigitalDocumentResponseDto = z.output<
  typeof constanciaDigitalDocumentResponseSchema
>

function normalizeConstanciaAliases(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value

  const response = value as Record<string, unknown>
  return {
    ...response,
    solicitudId: response.solicitudId ?? response.id_solicitud,
    numeroDocumento: response.numeroDocumento ?? response.dni,
  }
}
