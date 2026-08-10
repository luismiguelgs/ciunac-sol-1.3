import { ConsultedRequest, resolveRequestKind, resolveRequestStep } from '@/modules/consultas/domain/consulted-request'
import { ConsultationText } from '@/modules/consultas/domain/consultation-text'
import {
  ConsultationTextResponseDto,
  ConsultedRequestResponseDto,
} from '@/modules/consultas/infrastructure/dto/consultation.dto'

export function toConsultedRequest(dto: ConsultedRequestResponseDto): ConsultedRequest {
  return {
    id: dto.id,
    student: {
      id: dto.estudiante.id,
      names: dto.estudiante.nombres,
      lastNames: dto.estudiante.apellidos,
      documentNumber: dto.estudiante.numeroDocumento,
    },
    requestType: {
      id: dto.tiposSolicitud.id,
      name: dto.tiposSolicitud.solicitud,
      kind: resolveRequestKind(dto.tipoSolicitudId, dto.tiposSolicitud.solicitud),
    },
    language: { id: dto.idioma.id, name: dto.idioma.nombre },
    level: { id: dto.nivel.id, name: dto.nivel.nombre },
    status: {
      id: dto.estado.id,
      name: dto.estado.nombre,
      reference: dto.estado.referencia,
      step: resolveRequestStep(dto.estadoId, dto.estado.nombre),
    },
    createdAt: dto.creadoEn,
    digital: dto.digital,
    observations: dto.observaciones,
    payment: {
      amount: dto.pago,
      voucherNumber: dto.numeroVoucher,
      paidAt: dto.fechaPago,
    },
  }
}

export function toConsultationText(dto: ConsultationTextResponseDto): ConsultationText {
  return { code: dto.codigo, content: dto.contenido }
}
