import { AppError } from '@/modules/shared/application/errors/app-error'
import {
  NewStudentBasicData,
  NewStudent,
  NewStudentProgramOption,
} from '../model'
import { newStudentBasicDataSchema } from '../schemas'
import { IBasicInfoSchema } from './basic-info.schema'
import type { NewStudentDraft } from '../store'

export function toCompleteNewStudent(draft: NewStudentDraft): NewStudent | null {
  if (!draft.email || !draft.basicData) return null
  return { ...draft.basicData, email: draft.email }
}

export function toNewStudentBasicData(
  values: IBasicInfoSchema,
  programs: NewStudentProgramOption[],
): NewStudentBasicData {
  const program = programs.find((item) => item.code === values.code_program)
  if (!program) {
    throw new AppError({
      code: 'VALIDATION',
      status: 400,
      message: 'El programa seleccionado ya no se encuentra disponible.',
    })
  }

  return newStudentBasicDataSchema.parse({
    firstLastName: values.firstLastname,
    secondLastName: values.secondLastname,
    firstName: values.firstName,
    secondName: values.secondName,
    gender: values.gender,
    birthDate: toLocalDate(values.birth_date),
    phone: values.phone,
    document: {
      type: values.document_type,
      number: values.document.toUpperCase(),
    },
    program,
  })
}

export function toBasicInfoFormValues(data: NewStudentBasicData | null) {
  return {
    ...initialBasicInfoFormValues(),
    ...(data ? {
      firstLastname: data.firstLastName,
      secondLastname: data.secondLastName,
      firstName: data.firstName,
      secondName: data.secondName ?? '',
      code_program: data.program.code,
      birth_date: fromLocalDate(data.birthDate),
      gender: data.gender,
      document_type: data.document.type,
      phone: data.phone,
      document: data.document.number,
    } : {}),
  }
}

function initialBasicInfoFormValues() {
  return {
    firstLastname: '',
    secondLastname: '',
    firstName: '',
    secondName: '',
    code_program: '',
    birth_date: undefined as Date | undefined,
    gender: 'F' as const,
    document_type: 'DNI' as const,
    phone: '',
    document: '',
  }
}

function toLocalDate(date: Date): string {
  return [
    date.getFullYear().toString().padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function fromLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}
