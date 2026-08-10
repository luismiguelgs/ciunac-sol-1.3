import { z } from 'zod'
import { AppError } from '@/modules/shared/application/errors/app-error'
import { SolicitudConstancia } from '@/modules/solicitud-constancia/domain/solicitud-constancia'

const commonBasicFields = {
  typeId: z.union([z.literal(5), z.literal(6)]),
  languageId: z.number().int().positive(),
  levelId: z.number().int().positive(),
  names: z.string().trim().min(2),
  lastNames: z.string().trim().min(2),
  documentType: z.enum(['DNI', 'CE', 'PASAPORTE']),
  documentNumber: z.string().trim().min(8).max(12),
  phone: z.string().trim().regex(/^\d{9}$/),
  existingStudentId: z.string().trim().min(1).nullable(),
} as const

const basicDataSchema = z.discriminatedUnion('isUnacStudent', [
  z.object({
    ...commonBasicFields,
    isUnacStudent: z.literal(false),
  }).strict(),
  z.object({
    ...commonBasicFields,
    isUnacStudent: z.literal(true),
    facultyId: z.number().int().positive(),
    schoolId: z.number().int().positive(),
    studentCode: z.string().trim().min(1),
  }).strict(),
])

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
  basicData: basicDataSchema,
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
