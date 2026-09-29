import { z } from 'zod'
import type { CertificateDetail } from '@/modules/consulta-certificado/domain/certificate-detail'
import { AppError } from '@/modules/shared/application/errors/app-error'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'

const externalIdSchema = z.union([
  z.string().trim().min(1),
  z.number().finite(),
]).transform(String)

const nonNegativeIntegerSchema = z.union([
  z.number(),
  z.string().regex(/^\d+$/),
]).transform(Number).pipe(z.number().int().nonnegative())

const externalDateSchema = z.string().trim().min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Fecha externa no valida')
  .transform((value) => new Date(value).toISOString())

const nullableExternalDateSchema = z.union([z.string(), z.null(), z.undefined()])
  .transform((value) => typeof value === 'string' && value.trim() ? value.trim() : null)
  .refine((value) => value === null || !Number.isNaN(Date.parse(value)), 'Fecha externa no valida')
  .transform((value) => value === null ? null : new Date(value).toISOString())

const certificateNoteResponseSchema = z.object({
  ciclo: z.string().trim().min(1),
  modalidad: z.string().trim().optional().default(''),
  nota: z.number().finite(),
})

export const certificateDetailResponseSchema = z.object({
  _id: externalIdSchema,
  estudiante: z.string().trim().min(1),
  idioma: z.string().trim().min(1),
  nivel: z.string().trim().min(1),
  cantidadHoras: nonNegativeIntegerSchema,
  fechaEmision: externalDateSchema,
  numeroRegistro: z.string().trim().min(1),
  fechaConcluido: externalDateSchema,
  aceptado: z.boolean().nullish().transform(Boolean),
  fechaAceptacion: nullableExternalDateSchema,
  notas: z.array(certificateNoteResponseSchema).optional().default([]),
}).superRefine((value, context) => {
  if (value.aceptado && value.fechaAceptacion === null) {
    context.addIssue({
      code: 'custom',
      path: ['fechaAceptacion'],
      message: 'Un certificado aceptado requiere fecha de aceptacion',
    })
  }
})

export function normalizeCertificateLookupId(value: string): string | null {
  const id = value.trim()
  return /^[A-Za-z0-9_-]{1,80}$/.test(id) ? id : null
}

export function parseCertificateDetailResponse(value: unknown, requestedId: string): CertificateDetail {
  const dto = parseExternalResponse(
    certificateDetailResponseSchema,
    value,
    'La API devolvio un certificado incompleto o no valido.',
  )

  if (dto._id !== requestedId) {
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      status: 502,
      message: 'La API devolvio un certificado que no corresponde a la consulta.',
    })
  }

  return {
    studentName: dto.estudiante,
    language: dto.idioma,
    level: dto.nivel,
    hours: dto.cantidadHoras,
    issuedAt: dto.fechaEmision,
    registrationNumber: dto.numeroRegistro,
    completedAt: dto.fechaConcluido,
    delivery: dto.aceptado && dto.fechaAceptacion
      ? { status: 'accepted', acceptedAt: dto.fechaAceptacion }
      : { status: 'pending', acceptedAt: null },
    notes: dto.notas.map((note) => ({
      cycle: note.ciclo,
      modality: note.modalidad,
      grade: note.nota,
    })),
  }
}
