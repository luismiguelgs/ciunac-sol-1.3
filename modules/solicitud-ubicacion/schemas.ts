import { paymentSchema } from '@/modules/shared/application/payment.schema'
import { z } from 'zod'
import { AppError } from '@/modules/shared/application/errors/app-error'
import { isLocationDocument, type SolicitudUbicacion } from './model'

const documentReference = z.string().trim().min(1).max(2048).refine(
  (value) => value.startsWith('/') || /^https?:\/\//i.test(value),
)

const basicDataSchema = z.object({
  languageId: z.number().int().positive(),
  levelId: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  names: z.string().trim().min(2).max(80),
  lastNames: z.string().trim().min(2).max(80),
  documentType: z.enum(['DNI', 'CE', 'PASAPORTE']),
  documentNumber: z.string().trim().regex(/^[A-Za-z0-9]{8,9}$/),
  phone: z.string().trim().regex(/^\d{9}$/),
  identityDocumentUrl: documentReference,
  existingStudentId: z.string().trim().min(1).nullable(),
}).strict().superRefine((data, context) => {
  if (!isLocationDocument(data.documentType, data.documentNumber)) {
    context.addIssue({ code: 'custom', path: ['documentNumber'], message: 'Invalid document' })
  }
})

const locationPaymentSchema = paymentSchema.superRefine((data, context) => {
  if (data.voucher && !documentReference.safeParse(data.voucher.url).success) {
    context.addIssue({ code: 'custom', path: ['voucher', 'url'], message: 'Invalid document reference' })
  }
})

export const locationProfileCommandSchema = z.object({ isCiunacStudent: z.boolean() }).strict()

export const solicitudUbicacionDomainSchema: z.ZodType<SolicitudUbicacion> = z.object({
  email: z.string().trim().email().max(254),
  isCiunacStudent: z.boolean(),
  basicData: basicDataSchema,
  payment: locationPaymentSchema,
  studyCertificateUrl: documentReference.nullable(),
}).strict().superRefine((data, context) => {
  if (!data.isCiunacStudent && data.basicData.levelId !== 1) {
    context.addIssue({ code: 'custom', path: ['basicData', 'levelId'], message: 'Non-CIUNAC students use level 1' })
  }
  if (data.isCiunacStudent && !data.studyCertificateUrl) {
    context.addIssue({ code: 'custom', path: ['studyCertificateUrl'], message: 'Study certificate is required' })
  }
  if (!data.isCiunacStudent && data.studyCertificateUrl !== null) {
    context.addIssue({ code: 'custom', path: ['studyCertificateUrl'], message: 'Study certificate is not allowed' })
  }
})

export function parseSolicitudUbicacion(value: unknown): SolicitudUbicacion {
  const result = solicitudUbicacionDomainSchema.safeParse(value)
  if (!result.success) {
    throw new AppError({
      code: 'VALIDATION',
      status: 400,
      message: 'La solicitud de ubicacion contiene datos incompletos o invalidos.',
      details: { issueCount: result.error.issues.length },
    })
  }
  return result.data
}
