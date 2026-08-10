import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { mailApiRepository } from '@/modules/shared/infrastructure/api/mail-api.repository'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import {
  ConstanciaNotificationPort,
  ConstanciaRequestPort,
  ConstanciaStudentPort,
  RegisterSolicitudConstanciaUseCase,
} from '@/modules/solicitud-constancia/application/register-solicitud-constancia.use-case'
import { SolicitudConstancia } from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import { constanciaStudentRepository } from '@/modules/solicitud-constancia/infrastructure/constancia-student.repository'
import { ConstanciaRequestDto } from '@/modules/solicitud-constancia/infrastructure/dto/constancia-api.dto'
import { toConstanciaRequestDto } from '@/modules/solicitud-constancia/infrastructure/mappers/constancia-api.mapper'
import { constanciaCreateResponseSchema } from '@/modules/solicitud-constancia/infrastructure/validation/constancia-api.schemas'

class ConstanciaStudentAdapter implements ConstanciaStudentPort {
  async save(solicitud: SolicitudConstancia): Promise<string> {
    try {
      return await constanciaStudentRepository.save(solicitud)
    } catch (error) {
      throw externalError(error, 'No se pudo guardar la informacion del estudiante.')
    }
  }
}

class ConstanciaRequestAdapter implements ConstanciaRequestPort {
  async create(solicitud: SolicitudConstancia, studentId: string): Promise<string> {
    try {
      const body = toConstanciaRequestDto(solicitud, studentId)
      const response = await resourceApiRepository.create<unknown, ConstanciaRequestDto>('solicitudes', body)
      return parseExternalResponse(
        constanciaCreateResponseSchema,
        response,
        'No se pudo confirmar el identificador de la solicitud.',
      ).id
    } catch (error) {
      throw externalError(error, 'No se pudo guardar la solicitud de constancia.')
    }
  }
}

class ConstanciaNotificationAdapter implements ConstanciaNotificationPort {
  async sendSolicitudCreada(requestId: string): Promise<string> {
    try {
      return await mailApiRepository.send({ type: 'CONSTANCIA', reference: requestId })
    } catch (error) {
      const appError = externalError(error, 'La solicitud se guardo, pero el correo no pudo procesarse.')
      throw new AppError({
        code: appError.code,
        message: appError.message,
        status: appError.status,
        correlationId: appError.correlationId,
        retryable: true,
        cause: error,
      })
    }
  }
}

export function createRegisterSolicitudConstanciaUseCase() {
  return new RegisterSolicitudConstanciaUseCase({
    student: new ConstanciaStudentAdapter(),
    request: new ConstanciaRequestAdapter(),
    notification: new ConstanciaNotificationAdapter(),
  })
}

function externalError(error: unknown, message: string): AppError {
  const appError = normalizeAppError(error, message)
  return new AppError({
    code: 'EXTERNAL_SERVICE',
    message: appError.message,
    status: appError.status,
    correlationId: appError.correlationId,
    retryable: appError.retryable,
    cause: error,
  })
}
