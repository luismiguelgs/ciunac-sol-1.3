export const CERTIFICATE_TYPE_IDS = [1, 2, 3, 4] as const
export const CERTIFICATE_LEVEL_IDS = [1, 2, 3] as const

export type CertificateTypeId = (typeof CERTIFICATE_TYPE_IDS)[number]
export type CertificateLevelId = (typeof CERTIFICATE_LEVEL_IDS)[number]
export type CertificateDocumentType = 'DNI' | 'CE' | 'PASAPORTE'

export type CertificateType = {
  id: CertificateTypeId
  name: string
  price: number
}

export type CertificateLanguage = { id: number; name: string }
export type CertificateFaculty = { id: number; name: string; code: string }
export type CertificateSchool = { id: number; name: string; facultyId: number }
export type CertificateText = { code: string; content: string }

export type CertificateCatalogs = {
  requestTypes: CertificateType[]
  languages: CertificateLanguage[]
  faculties: CertificateFaculty[]
  schools: CertificateSchool[]
  texts: CertificateText[]
}

type CertificateBasicDataBase = {
  typeId: CertificateTypeId
  languageId: number
  levelId: CertificateLevelId
  names: string
  lastNames: string
  documentType: CertificateDocumentType
  documentNumber: string
  phone: string
  existingStudentId: string | null
}

export type CertificateBasicData = CertificateBasicDataBase & (
  | { isUnacStudent: false }
  | {
      isUnacStudent: true
      facultyId: number
      schoolId: number
      studentCode: string
    }
)

export type CertificateVoucher = {
  number: string
  paidAt: string
  url: string
}

export type CertificatePayment =
  | { amount: 0; voucher: null }
  | { amount: number; voucher: CertificateVoucher }

export type SolicitudCertificado = {
  email: string
  basicData: CertificateBasicData
  payment: CertificatePayment
}

export type CertificateStudentLookup = {
  id: string
  names: string
  lastNames: string
  phone: string
}

export type CertificateCargo = {
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

export function isCertificateType(value: number): value is CertificateTypeId {
  return CERTIFICATE_TYPE_IDS.includes(value as CertificateTypeId)
}

export function isCertificateLevel(value: number): value is CertificateLevelId {
  return CERTIFICATE_LEVEL_IDS.includes(value as CertificateLevelId)
}

export function isDigitalCertificateType(value: CertificateTypeId): boolean {
  return value === 2 || value === 4
}
