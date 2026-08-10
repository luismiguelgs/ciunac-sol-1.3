import { AppError } from '@/modules/shared/application/errors/app-error'
import {
  ScholarshipBasicData,
  ScholarshipCatalogs,
  ScholarshipDocuments,
} from '@/modules/solicitud-beca/domain/solicitud-beca'
import { IBasicInfoSchema } from '@/modules/solicitud-beca/schemas/basic-data.schema'
import { DocumentsFormValues } from '@/modules/solicitud-beca/schemas/documents.schema'
import {
  scholarshipBasicDataSchema,
  scholarshipDocumentsSchema,
} from '@/modules/solicitud-beca/schemas/solicitud-beca.schema'

export function toScholarshipBasicData(
  values: IBasicInfoSchema,
  catalogs: ScholarshipCatalogs,
): ScholarshipBasicData {
  const facultyId = Number(values.facultad)
  const schoolId = Number(values.escuela)
  const faculty = catalogs.faculties.find((item) => item.id === facultyId)
  const school = catalogs.schools.find((item) => item.id === schoolId)

  if (!faculty || !school || school.facultyId !== faculty.id) {
    throw new AppError({
      code: 'VALIDATION',
      status: 400,
      message: 'La facultad o escuela seleccionada no es válida.',
    })
  }

  return scholarshipBasicDataSchema.parse({
    names: values.nombres,
    lastNames: values.apellidos,
    phone: values.celular,
    documentType: values.tipo_documento,
    documentNumber: values.dni,
    address: values.direccion,
    studentCode: values.codigo,
    faculty: { id: faculty.id, name: faculty.name },
    school: { id: school.id, name: school.name },
  })
}

export function toScholarshipDocuments(values: DocumentsFormValues): ScholarshipDocuments {
  return scholarshipDocumentsSchema.parse({
    enrollmentCertificateUrl: values.constancia_matricula,
    academicHistoryUrl: values.historial_academico,
    meritCertificateUrl: values.constancia_tercio,
    commitmentLetterUrl: values.carta_compromiso,
    swornDeclarationUrl: values.declaracion_jurada,
  })
}

export function toBasicFormValues(data: ScholarshipBasicData | null): IBasicInfoSchema {
  return {
    apellidos: data?.lastNames ?? '',
    nombres: data?.names ?? '',
    facultad: data ? String(data.faculty.id) : '',
    escuela: data ? String(data.school.id) : '',
    direccion: data?.address ?? '',
    codigo: data?.studentCode ?? '',
    tipo_documento: data?.documentType ?? 'DNI',
    dni: data?.documentNumber ?? '',
    celular: data?.phone ?? '',
  }
}

export function toDocumentFormValues(data: ScholarshipDocuments | null): DocumentsFormValues {
  return {
    constancia_matricula: data?.enrollmentCertificateUrl ?? '',
    historial_academico: data?.academicHistoryUrl ?? '',
    constancia_tercio: data?.meritCertificateUrl ?? '',
    carta_compromiso: data?.commitmentLetterUrl ?? '',
    declaracion_jurada: data?.swornDeclarationUrl ?? '',
  }
}
