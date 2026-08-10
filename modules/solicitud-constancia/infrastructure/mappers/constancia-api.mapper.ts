import { obtenerPeriodo } from '@/lib/utils'
import {
  ConstanciaCargo,
  ConstanciaStudentLookup,
  SolicitudConstancia,
} from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import {
  ConstanciaCargoResponseDto,
  ConstanciaRequestDto,
  ConstanciaStudentLookupResponseDto,
  ConstanciaStudentRequestDto,
} from '@/modules/solicitud-constancia/infrastructure/dto/constancia-api.dto'

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

export function toConstanciaRequestDto(
  solicitud: SolicitudConstancia,
  studentId: string,
): ConstanciaRequestDto {
  return {
    estudianteId: studentId,
    tipoSolicitudId: solicitud.basicData.typeId,
    idiomaId: solicitud.basicData.languageId,
    nivelId: solicitud.basicData.levelId,
    estadoId: 1,
    periodo: obtenerPeriodo(),
    alumnoCiunac: solicitud.basicData.isUnacStudent,
    fechaPago: solicitud.payment.voucher?.paidAt,
    pago: solicitud.payment.amount,
    digital: true,
    numeroVoucher: solicitud.payment.voucher?.number,
    imgVoucher: solicitud.payment.voucher?.url,
  }
}

export function toConstanciaStudentLookup(dto: ConstanciaStudentLookupResponseDto): ConstanciaStudentLookup {
  return {
    id: dto.id,
    names: dto.nombres,
    lastNames: dto.apellidos,
    phone: dto.celular,
  }
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
