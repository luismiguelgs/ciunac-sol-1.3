import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { mailApiRepository } from '@/modules/shared/infrastructure/api/mail-api.repository'
import Isolicitud from '@/modules/shared/interfaces/solicitud.interface'
import {
  ConstanciaNotificationPort,
  ConstanciaRequestPort,
  ConstanciaStudentPort,
  RegisterSolicitudConstanciaUseCase,
} from '@/modules/solicitud-constancia/application/register-solicitud-constancia.use-case'
import { SolicitudConstanciaDraft } from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import EstudiantesService from '@/services/estudiantes.service'
import SolicitudesService from '@/services/solicitudes.service'

class ConstanciaStudentAdapter implements ConstanciaStudentPort {
  async save(solicitud: SolicitudConstanciaDraft) {
    try {
      const data = {
        nombres: solicitud.nombres,
        apellidos: solicitud.apellidos,
        tipo_documento: solicitud.tipoDocumento,
        dni: solicitud.numeroDocumento,
        celular: solicitud.celular,
        email: solicitud.email,
        facultad: solicitud.facultadId ? String(solicitud.facultadId) : undefined,
        escuela: solicitud.escuelaId ? String(solicitud.escuelaId) : undefined,
        codigo: solicitud.codigo,
      }

      return solicitud.estudianteId
        ? await EstudiantesService.updateItem(solicitud.estudianteId, data)
        : await EstudiantesService.newItem(data)
    } catch (error) {
      throw externalError(error, 'No se pudo guardar la informacion del estudiante.')
    }
  }
}

class ConstanciaRequestAdapter implements ConstanciaRequestPort {
  async create(solicitud: SolicitudConstanciaDraft, studentId: string) {
    try {
      return await SolicitudesService.newItem(toSolicitudRequest(solicitud, studentId))
    } catch (error) {
      throw externalError(error, 'No se pudo guardar la solicitud de constancia.')
    }
  }
}

class ConstanciaNotificationAdapter implements ConstanciaNotificationPort {
  async sendSolicitudCreada(requestId: string) {
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

function toSolicitudRequest(solicitud: SolicitudConstanciaDraft, studentId: string): Isolicitud {
  return {
    estudianteId: studentId,
    tipo_solicitud: String(solicitud.tipoSolicitudId),
    antiguo: false,
    apellidos: solicitud.apellidos,
    nombres: solicitud.nombres,
    tipo_documento: solicitud.tipoDocumento,
    celular: solicitud.celular,
    direccion: '',
    codigo: solicitud.codigo,
    dni: solicitud.numeroDocumento,
    email: solicitud.email,
    idioma: String(solicitud.idiomaId),
    nivel: String(solicitud.nivelId),
    numero_voucher: solicitud.numeroVoucher,
    facultad: solicitud.facultadId ? String(solicitud.facultadId) : undefined,
    escuela: solicitud.escuelaId ? String(solicitud.escuelaId) : undefined,
    fecha_pago: solicitud.fechaPago,
    trabajador: false,
    pago: solicitud.pago,
    alumno_ciunac: solicitud.alumnoUnac,
    img_voucher: solicitud.voucherUrl,
    digital: true,
    estado: 'NUEVO',
  }
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
