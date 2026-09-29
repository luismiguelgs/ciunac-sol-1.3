import { paymentSchema } from '@/modules/shared/application/payment.schema'
import { z } from 'zod'
import { AppError } from '@/modules/shared/application/errors/app-error'
import type { SolicitudCertificado } from './model'

const commonBasicFields = {
  typeId: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  languageId: z.number().int().positive(),
  levelId: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  names: z.string().trim().min(2),
  lastNames: z.string().trim().min(2),
  documentType: z.enum(['DNI', 'CE', 'PASAPORTE']),
  documentNumber: z.string().trim().min(8).max(9),
  phone: z.string().trim().regex(/^\d{9}$/),
  existingStudentId: z.string().trim().min(1).nullable(),
} as const

const certificateBasicDataSchema = z.discriminatedUnion('isUnacStudent', [
  z.object({ ...commonBasicFields, isUnacStudent: z.literal(false) }).strict(),
  z.object({
    ...commonBasicFields,
    isUnacStudent: z.literal(true),
    facultyId: z.number().int().positive(),
    schoolId: z.number().int().positive(),
    studentCode: z.string().trim().min(1),
  }).strict(),
]).superRefine((data, context) => {
  const expectedLength = data.documentType === 'DNI' ? 8 : 9
  if (data.documentNumber.length !== expectedLength) {
    context.addIssue({ code: 'custom', path: ['documentNumber'], message: 'Invalid document length' })
  }
})


export const solicitudCertificadoSchema: z.ZodType<SolicitudCertificado> = z.object({
  email: z.string().trim().email().max(254),
  basicData: certificateBasicDataSchema,
  payment: paymentSchema,
}).strict()

export function parseSolicitudCertificado(value: unknown): SolicitudCertificado {
  const result = solicitudCertificadoSchema.safeParse(value)
  if (!result.success) {
    throw new AppError({
      code: 'VALIDATION',
      status: 400,
      message: 'La solicitud de certificado contiene datos incompletos o invalidos.',
      details: { issueCount: result.error.issues.length },
    })
  }
  return result.data
}
