import 'server-only'

import { ScholarshipCatalogs } from '@/modules/solicitud-beca/domain/solicitud-beca'
import {
  toScholarshipFaculty,
  toScholarshipSchool,
} from '@/modules/solicitud-beca/infrastructure/mappers/scholarship-api.mapper'
import {
  scholarshipFacultyArraySchema,
  scholarshipSchoolArraySchema,
} from '@/modules/solicitud-beca/infrastructure/validation/scholarship-api.schemas'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'

export async function getScholarshipCatalogs(): Promise<ScholarshipCatalogs> {
  const [facultyResponse, schoolResponse] = await Promise.all([
    ciunacRequest<unknown>('facultades'),
    ciunacRequest<unknown>('escuelas'),
  ])

  const faculties = parseExternalResponse(
    scholarshipFacultyArraySchema,
    facultyResponse,
    'La API devolvió un catálogo de facultades vacío o inválido.',
  ).map(toScholarshipFaculty)
  const schools = parseExternalResponse(
    scholarshipSchoolArraySchema,
    schoolResponse,
    'La API devolvió un catálogo de escuelas vacío o inválido.',
  ).map(toScholarshipSchool)

  return { faculties, schools }
}
