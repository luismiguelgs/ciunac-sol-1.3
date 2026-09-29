import 'server-only'

import { obtenerPeriodo } from '@/lib/utils'
import { SecurityError } from '@/modules/security/server/security-error'
import { getScholarshipCatalogs } from './scholarship-catalog.repository'
import {
  scholarshipRequestDtoSchema,
  type ScholarshipRequestDto,
} from '../scholarship-api.schemas'

export async function validateScholarshipRequest(
  value: unknown,
  verifiedEmail: string,
): Promise<ScholarshipRequestDto> {
  const result = scholarshipRequestDtoSchema.safeParse(value)
  if (!result.success) {
    throw new SecurityError('INVALID_REQUEST', 400, 'Scholarship request payload is invalid')
  }

  if (result.data.email.toLowerCase() !== verifiedEmail.trim().toLowerCase()) {
    throw new SecurityError('FORBIDDEN', 403, 'Email does not match verified session')
  }

  let catalogs
  try {
    catalogs = await getScholarshipCatalogs()
  } catch (error) {
    throw new SecurityError(
      'SERVICE_UNAVAILABLE',
      503,
      error instanceof Error ? error.message : 'Scholarship catalogs are unavailable',
    )
  }

  const faculty = catalogs.faculties.find((item) => String(item.id) === result.data.facultadId)
  const school = catalogs.schools.find((item) => String(item.id) === result.data.escuelaId)
  if (!faculty || !school || school.facultyId !== faculty.id) {
    throw new SecurityError('INVALID_REQUEST', 400, 'Scholarship academic selection is invalid')
  }

  return {
    ...result.data,
    facultad: faculty.name,
    escuela: school.name,
    periodo: obtenerPeriodo(),
  }
}
