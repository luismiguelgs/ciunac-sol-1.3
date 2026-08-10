import { z } from 'zod'
import { AppError } from '@/modules/shared/application/errors/app-error'
import { SolicitudBeca } from '@/modules/solicitud-beca/domain/solicitud-beca'

const catalogItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(254),
}).strict()

const documentReferenceSchema = z.string().trim().min(1).max(2048).refine(
  (value) => value.startsWith('/') || /^https?:\/\//i.test(value),
  'La referencia del documento no es válida.',
)

export const scholarshipBasicDataSchema = z.object({
  names: z.string().trim().min(2).max(254),
  lastNames: z.string().trim().min(2).max(254),
  phone: z.string().trim().regex(/^\d{9}$/),
  documentType: z.enum(['DNI', 'CE', 'PASAPORTE']),
  documentNumber: z.string().trim().regex(/^[A-Za-z0-9]+$/),
  address: z.string().trim().max(500),
  studentCode: z.string().trim().min(1).max(254),
  faculty: catalogItemSchema,
  school: catalogItemSchema,
}).strict().superRefine((data, context) => {
  const expectedLength = data.documentType === 'DNI' ? 8 : 9
  if (data.documentNumber.length !== expectedLength) {
    context.addIssue({
      code: 'custom',
      message: `El documento debe tener ${expectedLength} caracteres.`,
      path: ['documentNumber'],
    })
  }
})

export const scholarshipDocumentsSchema = z.object({
  enrollmentCertificateUrl: documentReferenceSchema,
  academicHistoryUrl: documentReferenceSchema,
  meritCertificateUrl: documentReferenceSchema,
  commitmentLetterUrl: documentReferenceSchema,
  swornDeclarationUrl: documentReferenceSchema,
}).strict()

export const solicitudBecaSchema: z.ZodType<SolicitudBeca> = z.object({
  email: z.string().trim().email().max(254),
  basicData: scholarshipBasicDataSchema,
  documents: scholarshipDocumentsSchema,
}).strict()

export function parseSolicitudBeca(value: unknown): SolicitudBeca {
  const result = solicitudBecaSchema.safeParse(value)
  if (!result.success) {
    throw new AppError({
      code: 'VALIDATION',
      status: 400,
      message: 'La solicitud de beca contiene datos incompletos o inválidos.',
      details: { issueCount: result.error.issues.length },
    })
  }
  return result.data
}
