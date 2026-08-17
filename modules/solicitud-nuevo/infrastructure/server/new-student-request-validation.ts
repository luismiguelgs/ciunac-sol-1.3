import 'server-only'

import { NextRequest } from 'next/server'
import { Q10StudentRequestDto } from '@/modules/solicitud-nuevo/infrastructure/dto/q10-student-request.dto'
import { getNewStudentPrograms } from '@/modules/solicitud-nuevo/infrastructure/server/q10-program.repository'
import { q10StudentRequestSchema } from '@/modules/solicitud-nuevo/infrastructure/validation/q10-api.schemas'
import { readVerifiedSessionFromRequest } from '@/modules/security/server/session'
import { SecurityError } from '@/modules/security/server/security-error'

export async function validateNewStudentRequest(
  request: NextRequest,
  body: unknown,
): Promise<Q10StudentRequestDto> {
  const parsed = q10StudentRequestSchema.safeParse(body)
  if (!parsed.success) {
    throw new SecurityError('INVALID_REQUEST', 400, 'New student payload is invalid')
  }

  const session = readVerifiedSessionFromRequest(request, 'NUEVO')
  if (!session) {
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
