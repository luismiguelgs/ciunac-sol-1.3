export const CONSTANCIA_TYPE_IDS = [5, 6] as const
export const CONSTANCIA_LEVEL_IDS = [1, 2, 3] as const

export type ConstanciaTypeId = (typeof CONSTANCIA_TYPE_IDS)[number]
export type ConstanciaLevelId = (typeof CONSTANCIA_LEVEL_IDS)[number]
export type ConstanciaDocumentType = 'DNI' | 'CE' | 'PASAPORTE'

export type ConstanciaType = {
  id: ConstanciaTypeId
  name: string
  price: number
}

export type ConstanciaLanguage = { id: number; name: string }
export type ConstanciaFaculty = { id: number; name: string; code: string }
export type ConstanciaSchool = { id: number; name: string; facultyId: number }
export type ConstanciaText = { code: string; content: string }

export type ConstanciaCatalogs = {
  requestTypes: ConstanciaType[]
  languages: ConstanciaLanguage[]
  faculties: ConstanciaFaculty[]
  schools: ConstanciaSchool[]
  texts: ConstanciaText[]
}

type ConstanciaBasicDataBase = {
  typeId: ConstanciaTypeId
  languageId: number
  levelId: ConstanciaLevelId
  names: string
  lastNames: string
  documentType: ConstanciaDocumentType
  documentNumber: string
  phone: string
  existingStudentId: string | null
}

export type ConstanciaBasicData = ConstanciaBasicDataBase & (
  | { isUnacStudent: false }
  | {
      isUnacStudent: true
      facultyId: number
      schoolId: number
      studentCode: string
    }
)

export type ConstanciaVoucher = {
  number: string
  paidAt: string
  url: string
}

export type ConstanciaPayment =
  | { amount: 0; voucher: null }
  | { amount: number; voucher: ConstanciaVoucher }

export type SolicitudConstancia = {
  email: string
  basicData: ConstanciaBasicData
  payment: ConstanciaPayment
}

export type ConstanciaStudentLookup = {
  id: string
  names: string
  lastNames: string
  phone: string
}

export type ConstanciaCargo = {
  id: number
  typeName: string
  createdAt: string
  student: {
    names: string
    lastNames: string
    documentNumber: string
  }
  languageName: string
  levelName: string
  amount: number
  voucherNumber: string | null
  paidAt: string | null
}

export function isConstanciaType(value: number): value is ConstanciaTypeId {
  return CONSTANCIA_TYPE_IDS.includes(value as ConstanciaTypeId)
}

export function isConstanciaLevel(value: number): value is ConstanciaLevelId {
  return CONSTANCIA_LEVEL_IDS.includes(value as ConstanciaLevelId)
}

export function hasConsistentConstanciaCatalogs(catalogs: ConstanciaCatalogs): boolean {
  const facultyIds = new Set(catalogs.faculties.map((faculty) => faculty.id))
  return catalogs.schools.every((school) => facultyIds.has(school.facultyId))
}

export function normalizeConstanciaDocumentNumber(value: string): string {
  return value.trim().toLocaleUpperCase()
}

export function isConstanciaDocumentNumber(value: string): boolean {
  return /^[A-Z0-9]{8,9}$/.test(normalizeConstanciaDocumentNumber(value))
}
