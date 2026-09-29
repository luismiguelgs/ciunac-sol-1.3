import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { mailApiRepository } from '@/modules/shared/infrastructure/api/mail-api.repository'
import { apiFetch } from '@/lib/api.service'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import type { SolicitudBeca } from '../model'
import { toScholarshipRequestDto } from './scholarship-api.mapper'
import { scholarshipCreateResponseSchema } from './scholarship-api.schemas'

export async function createScholarshipRequest(solicitud: SolicitudBeca): Promise<string> {
  const body = toScholarshipRequestDto(solicitud)
  const response = await apiFetch<unknown>('solicitudbecas', 'POST', body)
  const parsed = parseExternalResponse(
    scholarshipCreateResponseSchema,
    response,
    'No se pudo confirmar el identificador de la beca.',
  )

  const requestId = parsed._id ?? parsed.id
  if (!requestId) {
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      message: 'No se pudo confirmar el identificador de la beca.',
    })
  }
  return requestId
}

export async function sendScholarshipNotification(requestId: string): Promise<string> {
  try {
    return await mailApiRepository.send({ type: 'BECA', reference: requestId })
  } catch (error) {
    throw normalizeAppError(
      error,
      'La solicitud de beca se guardo, pero el correo no pudo enviarse',
    )
  }
}
