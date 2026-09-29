import { toPaymentRequestFields } from '@/modules/shared/infrastructure/api/payment-fields'
import { obtenerPeriodo } from '@/lib/utils'
import {
  CertificateCargo,
  CertificateCatalogs,
  CertificateStudentLookup,
  CertificateType,
  SolicitudCertificado,
  isDigitalCertificateType,
} from '../model'
import type {
  CertificateRequestDto,
  CertificateCargoResponseDto,
  CertificateFacultyResponseDto,
  CertificateLanguageResponseDto,
  CertificateSchoolResponseDto,
  CertificateStudentLookupResponseDto,
  CertificateTextResponseDto,
  CertificateTypeResponseDto,
} from './certificate-api.schemas'

type CertificateStudentRequestDto = {
  nombres: string
  apellidos: string
  tipoDocumento: SolicitudCertificado['basicData']['documentType']
  numeroDocumento: string
  celular: string
  email: string
  facultadId?: number
  escuelaId?: number
  codigo?: string
}

export function toCertificateStudentRequestDto(solicitud: SolicitudCertificado): CertificateStudentRequestDto {
  const { basicData } = solicitud
  return {
    nombres: basicData.names.toLocaleUpperCase(),
    apellidos: basicData.lastNames.toLocaleUpperCase(),
    tipoDocumento: basicData.documentType,
    numeroDocumento: basicData.documentNumber,
    celular: basicData.phone,
    email: solicitud.email,
    facultadId: basicData.isUnacStudent ? basicData.facultyId : undefined,
    escuelaId: basicData.isUnacStudent ? basicData.schoolId : undefined,
    codigo: basicData.isUnacStudent ? basicData.studentCode : undefined,
  }
}

export function toCertificateRequestDto(
  solicitud: SolicitudCertificado,
  studentId: string,
): CertificateRequestDto {
  return {
    estudianteId: studentId,
    tipoSolicitudId: solicitud.basicData.typeId,
    idiomaId: solicitud.basicData.languageId,
    nivelId: solicitud.basicData.levelId,
    estadoId: 1,
    periodo: obtenerPeriodo(),
    alumnoCiunac: solicitud.basicData.isUnacStudent,
    ...toPaymentRequestFields(solicitud.payment),
    digital: isDigitalCertificateType(solicitud.basicData.typeId),
  }
}

export function toCertificateStudentLookup(dto: CertificateStudentLookupResponseDto): CertificateStudentLookup {
  return {
    id: dto.id,
    names: dto.nombres,
    lastNames: dto.apellidos,
    phone: dto.celular,
  }
}

export function toCertificateCargo(dto: CertificateCargoResponseDto): CertificateCargo {
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

export function toCertificateType(dto: CertificateTypeResponseDto): CertificateType {
  return { id: dto.id, name: dto.solicitud, price: dto.precio }
}

export function toCertificateCatalogs(
  requestTypes: CertificateTypeResponseDto[],
  languages: CertificateLanguageResponseDto[],
  faculties: CertificateFacultyResponseDto[],
  schools: CertificateSchoolResponseDto[],
  texts: CertificateTextResponseDto[],
): CertificateCatalogs {
  return {
    requestTypes: requestTypes.map(toCertificateType),
    languages: languages.map((item) => ({ id: item.id, name: item.nombre })),
    faculties: faculties.map((item) => ({ id: item.id, name: item.nombre, code: item.codigo })),
    schools: schools.map((item) => ({ id: item.id, name: item.nombre, facultyId: item.facultadId })),
    texts: texts.map((item) => ({ code: item.codigo, content: item.contenido })),
  }
}
