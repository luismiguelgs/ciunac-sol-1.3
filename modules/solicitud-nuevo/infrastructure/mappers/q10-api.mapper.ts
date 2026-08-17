import { NewStudent, NewStudentProgramOption } from '@/modules/solicitud-nuevo/domain/new-student'
import { Q10StudentRequestDto } from '@/modules/solicitud-nuevo/infrastructure/dto/q10-student-request.dto'
import { Q10ProgramResponseDto } from '@/modules/solicitud-nuevo/infrastructure/validation/q10-api.schemas'

const HIDDEN_PROGRAM_NAME_PATTERNS = ['2026', 'kids', 'juniors']

export function toQ10StudentRequestDto(student: NewStudent): Q10StudentRequestDto {
  return {
    Primer_apellido: student.firstLastName.toLocaleUpperCase(),
    Segundo_apellido: student.secondLastName.toLocaleUpperCase(),
    Primer_nombre: student.firstName.toLocaleUpperCase(),
    ...(student.secondName ? { Segundo_nombre: student.secondName.toLocaleUpperCase() } : {}),
    Email: student.email.toLowerCase(),
    Codigo_tipo_identificacion: student.document.type === 'DNI' ? 'PE01' : 'PE02',
    Numero_identificacion: student.document.number.toUpperCase(),
    Genero: student.gender,
    Fecha_nacimiento: `${student.birthDate}T00:00:00.000Z`,
    Telefono: student.phone,
    Celular: student.phone,
    Codigo_programa: student.program.code,
  }
}

export function toNewStudentProgramOption(dto: Q10ProgramResponseDto): NewStudentProgramOption {
  return { code: dto.Codigo, name: dto.Nombre }
}

export function isVisibleNewStudentProgram(dto: Q10ProgramResponseDto): boolean {
  if (dto.Numero_resolucion !== null) return false
  const name = dto.Nombre.toLowerCase()
  return !HIDDEN_PROGRAM_NAME_PATTERNS.some((pattern) => name.includes(pattern))
}
