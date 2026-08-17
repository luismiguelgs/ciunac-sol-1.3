import { z } from 'zod'
import { AppError } from '@/modules/shared/application/errors/app-error'
import type { SolicitudConstancia } from '@/modules/solicitud-constancia/domain/solicitud-constancia'

const commonBasicFields = {
  typeId: z.union([z.literal(5), z.literal(6)]),
  languageId: z.number().int().positive(),
  levelId: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  names: z.string().trim().min(2),
  lastNames: z.string().trim().min(2),
  documentType: z.enum(['DNI', 'CE', 'PASAPORTE']),
  documentNumber: z.string().trim().min(8).max(9),
  phone: z.string().trim().regex(/^\d{9}$/),
  existingStudentId: z.string().trim().min(1).nullable(),
} as const

const constanciaBasicDataSchema = z.discriminatedUnion('isUnacStudent', [
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

const voucherSchema = z.object({
  number: z.string().regex(/^\d{15}$/),
  paidAt: z.string().datetime(),
  url: z.string().trim().min(1).max(2048),
}).strict()

const paymentSchema = z.union([
  z.object({ amount: z.literal(0), voucher: z.null() }).strict(),
  z.object({ amount: z.number().positive(), voucher: voucherSchema }).strict(),
])

export const solicitudConstanciaSchema: z.ZodType<SolicitudConstancia> = z.object({
  email: z.string().trim().email().max(254),
  basicData: constanciaBasicDataSchema,
  payment: paymentSchema,
}).strict()

export function parseSolicitudConstancia(value: unknown): SolicitudConstancia {
  const result = solicitudConstanciaSchema.safeParse(value)
  if (!result.success) {
    throw new AppError({
      code: 'VALIDATION',
      status: 400,
      message: 'La solicitud de constancia contiene datos incompletos o invalidos.',
      details: { issueCount: result.error.issues.length },
    })
  }
  return result.data
}
