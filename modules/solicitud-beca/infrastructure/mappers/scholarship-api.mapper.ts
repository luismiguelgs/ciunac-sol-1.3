import { obtenerPeriodo } from '@/lib/utils'
import {
  ScholarshipFaculty,
  ScholarshipSchool,
  SolicitudBeca,
} from '@/modules/solicitud-beca/domain/solicitud-beca'
import {
  ScholarshipFacultyResponseDto,
  ScholarshipRequestDto,
  ScholarshipSchoolResponseDto,
} from '@/modules/solicitud-beca/infrastructure/dto/scholarship-api.dto'

export function toScholarshipRequestDto(solicitud: SolicitudBeca): ScholarshipRequestDto {
  return {
    nombres: solicitud.basicData.names.toLocaleUpperCase(),
    apellidos: solicitud.basicData.lastNames.toLocaleUpperCase(),
    telefono: solicitud.basicData.phone,
    tipo_documento: solicitud.basicData.documentType,
    numero_documento: solicitud.basicData.documentNumber,
    facultad: solicitud.basicData.faculty.name,
    facultadId: String(solicitud.basicData.faculty.id),
    escuela: solicitud.basicData.school.name,
    escuelaId: String(solicitud.basicData.school.id),
    codigo: solicitud.basicData.studentCode,
    direccion: solicitud.basicData.address.toLocaleUpperCase(),
    email: solicitud.email,
    periodo: obtenerPeriodo(),
    carta_de_compromiso: solicitud.documents.commitmentLetterUrl,
    historial_academico: solicitud.documents.academicHistoryUrl,
    constancia_matricula: solicitud.documents.enrollmentCertificateUrl,
    contancia_tercio: solicitud.documents.meritCertificateUrl,
    declaracion_jurada: solicitud.documents.swornDeclarationUrl,
  }
}

export function toScholarshipFaculty(dto: ScholarshipFacultyResponseDto): ScholarshipFaculty {
  return { id: dto.id, name: dto.nombre, code: dto.codigo }
}

export function toScholarshipSchool(dto: ScholarshipSchoolResponseDto): ScholarshipSchool {
  return { id: dto.id, name: dto.nombre, facultyId: dto.facultadId }
}
