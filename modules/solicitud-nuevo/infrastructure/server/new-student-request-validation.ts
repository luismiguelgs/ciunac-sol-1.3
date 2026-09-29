import 'server-only'

import type { Q10StudentRequestDto } from '../q10-api.schemas'
import { getNewStudentPrograms } from './q10-program.repository'
import { q10StudentRequestSchema } from '../q10-api.schemas'
import type { VerifiedSession } from '@/modules/security/server/session'
import { SecurityError } from '@/modules/security/server/security-error'

export async function validateNewStudentRequest(
  body: unknown,
  session: VerifiedSession | null,
): Promise<Q10StudentRequestDto> {
  const parsed = q10StudentRequestSchema.safeParse(body)
  if (!parsed.success) {
    throw new SecurityError('INVALID_REQUEST', 400, 'New student payload is invalid')
  }

  if (session?.purpose !== 'NUEVO') {
    throw new SecurityError('UNAUTHORIZED', 401, 'Verified new student session is required')
  }
  if (parsed.data.Email !== session.email) {
    throw new SecurityError('INVALID_REQUEST', 422, 'Email does not match verified session')
  }

  const programs = await getNewStudentPrograms()
  if (!programs.some((program) => program.code === parsed.data.Codigo_programa)) {
    throw new SecurityError('INVALID_REQUEST', 422, 'Selected Q10 program is not available')
  }

  return { ...parsed.data, Email: session.email }
}
