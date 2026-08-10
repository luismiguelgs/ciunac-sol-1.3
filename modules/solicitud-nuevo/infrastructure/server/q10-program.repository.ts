import 'server-only'

import { AppError } from '@/modules/shared/application/errors/app-error'
import { NewStudentProgramOption } from '@/modules/solicitud-nuevo/domain/new-student'
import { getQ10ApiKey } from '@/modules/security/server/environment'
import {
  isVisibleNewStudentProgram,
  toNewStudentProgramOption,
} from '@/modules/solicitud-nuevo/infrastructure/mappers/q10-api.mapper'
import { q10ProgramArraySchema } from '@/modules/solicitud-nuevo/infrastructure/validation/q10-api.schemas'

const Q10_PROGRAMS_URL = 'https://api.q10.com/v1/programas?Limit=30'

export async function getNewStudentPrograms(): Promise<NewStudentProgramOption[]> {
  let response: Response
  try {
    response = await fetch(Q10_PROGRAMS_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': getQ10ApiKey(),
      },
      cache: 'no-store',
    })
  } catch (error) {
    throw new AppError({
      code: 'NETWORK',
      message: 'No se pudo consultar el catalogo de programas de Q10.',
      cause: error,
      retryable: true,
    })
  }

  if (!response.ok) {
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      status: response.status,
      message: 'Q10 no pudo proporcionar el catalogo de programas.',
      retryable: response.status >= 500,
    })
  }

  const payload = await response.json().catch((error) => {
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      message: 'Q10 devolvio un catalogo de programas no valido.',
      cause: error,
    })
  })
  const parsed = q10ProgramArraySchema.safeParse(payload)
  if (!parsed.success) {
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      message: 'Q10 devolvio un catalogo de programas no valido.',
      details: { issueCount: parsed.error.issues.length },
    })
  }

  return parsed.data.filter(isVisibleNewStudentProgram).map(toNewStudentProgramOption)
}
