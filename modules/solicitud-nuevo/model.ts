export type NewStudentDocument =
  | { type: 'DNI'; number: string }
  | { type: 'CE'; number: string }

export type NewStudentProgramOption = {
  code: string
  name: string
}

export type NewStudentBasicData = {
  firstLastName: string
  secondLastName: string
  firstName: string
  secondName: string | null
  gender: 'F' | 'M'
  birthDate: string
  phone: string
  document: NewStudentDocument
  program: NewStudentProgramOption
}

export type NewStudent = NewStudentBasicData & {
  email: string
}
