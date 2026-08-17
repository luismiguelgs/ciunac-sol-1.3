import { obtenerPeriodo } from '@/lib/utils'
import {
  LOCATION_REQUEST_TYPE_ID,
  ExistingLocationRequest,
  LocationCargo,
  LocationCatalogs,
  LocationSchedule,
  LocationStudentLookup,
  SolicitudUbicacion,
} from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import {
  LocationRequestDto,
  LocationStudentRequestDto,
} from '@/modules/solicitud-ubicacion/infrastructure/dto/location-api.dto'
import type {
  LocationCargoResponseDto,
  LocationDuplicateResponseDto,
  LocationLanguageResponseDto,
  LocationScheduleResponseDto,
  LocationStudentLookupResponseDto,
  LocationTextResponseDto,
  LocationTypeResponseDto,
} from '@/modules/solicitud-ubicacion/infrastructure/validation/location-api.schemas'

export function toLocationStudentRequestDto(solicitud: SolicitudUbicacion): LocationStudentRequestDto {
  return {
    nombres: solicitud.basicData.names.toLocaleUpperCase(),
    apellidos: solicitud.basicData.lastNames.toLocaleUpperCase(),
    tipoDocumento: solicitud.basicData.documentType,
    numeroDocumento: solicitud.basicData.documentNumber,
    celular: solicitud.basicData.phone,
    email: solicitud.email,
    imgDoc: solicitud.basicData.identityDocumentUrl,
  }
}

export function toLocationRequestDto(solicitud: SolicitudUbicacion, studentId: string): LocationRequestDto {
  return {
    estudianteId: studentId,
    tipoSolicitudId: LOCATION_REQUEST_TYPE_ID,
    idiomaId: solicitud.basicData.languageId,
    nivelId: solicitud.basicData.levelId,
    estadoId: 1,
    periodo: obtenerPeriodo(),
    alumnoCiunac: solicitud.isCiunacStudent,
    fechaPago: solicitud.payment.voucher?.paidAt,
    pago: solicitud.payment.amount,
    digital: false,
    numeroVoucher: solicitud.payment.voucher?.number,
    imgCertEstudio: solicitud.studyCertificateUrl ?? undefined,
    imgVoucher: solicitud.payment.voucher?.url,
  }
}

export function toLocationStudentLookup(dto: LocationStudentLookupResponseDto): LocationStudentLookup {
  return { id: dto.id, names: dto.nombres, lastNames: dto.apellidos, phone: dto.celular }
}

export function toExistingLocationRequest(dto: LocationDuplicateResponseDto): ExistingLocationRequest {
  return {
    statusId: dto.estadoId,
    languageId: dto.idiomaId,
    requestTypeId: dto.tipoSolicitudId,
  }
}

export function toLocationCatalogs(
  requestType: LocationTypeResponseDto,
  languages: LocationLanguageResponseDto[],
  texts: LocationTextResponseDto[],
): LocationCatalogs {
  return {
    requestType: { id: requestType.id, name: requestType.solicitud, price: requestType.precio },
    languages: languages.map((item) => ({ id: item.id, name: item.nombre })),
    texts: texts.map((item) => ({ code: item.codigo, content: item.contenido })),
  }
}

export function toLocationSchedule(dto: LocationScheduleResponseDto): LocationSchedule {
  return {
    id: dto.id,
    moduleId: dto.moduloId,
    moduleName: dto.modulo.nombre,
    scheduledAt: dto.fecha,
    active: dto.activo,
  }
}

export function toLocationCargo(dto: LocationCargoResponseDto): LocationCargo {
  return {
    id: dto.id,
    typeName: dto.tiposSolicitud.solicitud,
    createdAt: dto.creadoEn,
    student: {
      names: dto.estudiante.nombres,
      lastNames: dto.estudiante.apellidos,
      documentNumber: dto.estudiante.numeroDocumento,
    },
    languageName: dto.idioma.nombre,
    levelName: dto.nivel.nombre,
    amount: dto.pago,
    voucherNumber: dto.numeroVoucher,
    paidAt: dto.fechaPago,
  }
}
