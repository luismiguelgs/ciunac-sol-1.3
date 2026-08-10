import { AppError } from '@/modules/shared/application/errors/app-error'
import { NewStudentGateway } from '@/modules/solicitud-nuevo/application/ports/register-new-student.ports';
import { NewStudent } from '@/modules/solicitud-nuevo/domain/new-student'
import { Q10StudentRequestDto } from '@/modules/solicitud-nuevo/infrastructure/dto/q10-api.dto'
import { toQ10StudentRequestDto } from '@/modules/solicitud-nuevo/infrastructure/mappers/q10-api.mapper'
import { q10RegistrationResponseSchema } from '@/modules/solicitud-nuevo/infrastructure/validation/q10-api.schemas'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'

export class Q10StudentGateway implements NewStudentGateway {
  async register(student: NewStudent): Promise<void> {
    const result = await resourceApiRepository.postSafe<unknown, Q10StudentRequestDto>(
      'q10/estudiantes',
      toQ10StudentRequestDto(student),
    )
    if (!result.ok) throw result.error
    if (result.kind === 'empty') return

    const parsed = q10RegistrationResponseSchema.safeParse(result.data)
    if (!parsed.success) {
      throw new AppError({
        code: 'EXTERNAL_SERVICE',
        message: 'Q10 devolvio una respuesta no valida. No vuelva a registrar al estudiante.',
        details: { issueCount: parsed.error.issues.length },
      })
    }
  }
}
