import { z } from 'zod'
import { AppError } from '@/modules/shared/application/errors/app-error'
import { NewStudent } from '@/modules/solicitud-nuevo/domain/new-student'

const requiredText = z.string().trim().min(2).max(80)
const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isValidPastOrPresentDate, {
  message: 'La fecha de nacimiento no es valida.',
})

const documentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('DNI'),
    number: z.string().regex(/^\d{8}$/),
  }),
  z.object({
    type: z.literal('CE'),
    number: z.string().regex(/^[A-Za-z0-9]{9}$/).transform((value) => value.toUpperCase()),
  }),
])

export const newStudentBasicDataSchema = z.object({
  firstLastName: requiredText,
  secondLastName: requiredText,
  firstName: requiredText,
  secondName: z.string().trim().max(80).transform((value) => value || null).nullable(),
  gender: z.enum(['F', 'M']),
  birthDate: localDateSchema,
  phone: z.string().regex(/^\d{9}$/),
  document: documentSchema,
  program: z.object({
    code: z.string().trim().min(1).max(80),
    name: z.string().trim().min(1).max(254),
  }),
})

export const newStudentSchema: z.ZodType<NewStudent> = newStudentBasicDataSchema.extend({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
})

export function parseNewStudent(value: unknown): NewStudent {
  const result = newStudentSchema.safeParse(value)
  if (!result.success) {
    throw new AppError({
      code: 'VALIDATION',
      status: 400,
      message: 'Los datos del alumno nuevo no estan completos o no son validos.',
      details: { issueCount: result.error.issues.length },
    })
  }
  return result.data
}

function isValidPastOrPresentDate(value: string): boolean {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) return false

  const today = new Date()
  const todayValue = [
    today.getFullYear().toString().padStart(4, '0'),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')
  return value <= todayValue
}
