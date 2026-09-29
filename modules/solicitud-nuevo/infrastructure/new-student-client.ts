import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { apiFetchResult } from '@/lib/api.service'
import { mailApiRepository } from '@/modules/shared/infrastructure/api/mail-api.repository'
import type { NewStudent } from '../model'
import { toQ10StudentRequestDto } from './q10-api.mapper'
import { q10RegistrationResponseSchema } from './q10-api.schemas'

export async function registerQ10Student(student: NewStudent): Promise<void> {
  const body = toQ10StudentRequestDto(student)
  const result = await apiFetchResult<unknown>('q10/estudiantes', 'POST', body)
  if (!result.ok) throw result.error
  if (result.kind === 'empty') return

  const parsed = q10RegistrationResponseSchema.safeParse(result.data)
  if (!parsed.success) {
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      message: 'Q10 devolvio una respuesta no valida. No vuelva a registrar al estudiante.',
      details: { issueCount: parsed.error.issues.length },
    })
  }
}

export async function sendNewStudentNotification(documentNumber: string): Promise<string> {
  try {
    return await mailApiRepository.send({ type: 'REGISTER', reference: documentNumber })
  } catch (error) {
    throw normalizeAppError(error, 'El estudiante se guardo, pero el correo no pudo enviarse.')
  }
}
