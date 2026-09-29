import { toPaymentRequestFields } from '@/modules/shared/infrastructure/api/payment-fields'
import { obtenerPeriodo } from '@/lib/utils'
import type {
  ConstanciaCargo,
  ConstanciaCatalogs,
  ConstanciaStudentLookup,
  ConstanciaType,
  SolicitudConstancia,
} from '../model'
import type {
  ConstanciaRequestDto,
  ConstanciaCargoResponseDto,
  ConstanciaFacultyResponseDto,
  ConstanciaLanguageResponseDto,
  ConstanciaSchoolResponseDto,
  ConstanciaStudentLookupResponseDto,
  ConstanciaTextResponseDto,
  ConstanciaTypeResponseDto,
} from './constancia-api.schemas'

type ConstanciaStudentRequestDto = {
  nombres: string
  apellidos: string
  tipoDocumento: SolicitudConstancia['basicData']['documentType']
  numeroDocumento: string
  celular: string
  email: string
  facultadId?: number
  escuelaId?: number
  codigo?: string
}

export function toConstanciaStudentRequestDto(solicitud: SolicitudConstancia): ConstanciaStudentRequestDto {
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

export function toConstanciaRequestDto(solicitud: SolicitudConstancia, studentId: string): ConstanciaRequestDto {
  return {
    estudianteId: studentId,
    tipoSolicitudId: solicitud.basicData.typeId,
    idiomaId: solicitud.basicData.languageId,
    nivelId: solicitud.basicData.levelId,
    estadoId: 1,
    periodo: obtenerPeriodo(),
    alumnoCiunac: solicitud.basicData.isUnacStudent,
    ...toPaymentRequestFields(solicitud.payment),
    digital: true,
  }
}

export function toConstanciaStudentLookup(dto: ConstanciaStudentLookupResponseDto): ConstanciaStudentLookup {
  return { id: dto.id, names: dto.nombres, lastNames: dto.apellidos, phone: dto.celular }
}

export function toConstanciaCargo(dto: ConstanciaCargoResponseDto): ConstanciaCargo {
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

export function toConstanciaType(dto: ConstanciaTypeResponseDto): ConstanciaType {
  return { id: dto.id, name: dto.solicitud, price: dto.precio }
}

export function toConstanciaCatalogs(
  requestTypes: ConstanciaTypeResponseDto[],
  languages: ConstanciaLanguageResponseDto[],
  faculties: ConstanciaFacultyResponseDto[],
  schools: ConstanciaSchoolResponseDto[],
  texts: ConstanciaTextResponseDto[],
): ConstanciaCatalogs {
  return {
    requestTypes: requestTypes.map(toConstanciaType),
    languages: languages.map((item) => ({ id: item.id, name: item.nombre })),
    faculties: faculties.map((item) => ({ id: item.id, name: item.nombre, code: item.codigo })),
    schools: schools.map((item) => ({ id: item.id, name: item.nombre, facultyId: item.facultadId })),
    texts: texts.map((item) => ({ code: item.codigo, content: item.contenido })),
  }
}
