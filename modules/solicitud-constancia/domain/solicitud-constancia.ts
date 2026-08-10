export const CONSTANCIA_TYPE_IDS = [5, 6] as const

export type ConstanciaTypeId = (typeof CONSTANCIA_TYPE_IDS)[number]
export type ConstanciaDocumentType = 'DNI' | 'CE' | 'PASAPORTE'

type ConstanciaBasicDataBase = {
  typeId: ConstanciaTypeId
  languageId: number
  levelId: number
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
