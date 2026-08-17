export const LOCATION_REQUEST_TYPE_ID = 7 as const
export const LOCATION_EXAM_PRICE = 30
export const LOCATION_LEVEL_IDS = [1, 2, 3] as const

export type LocationRequestTypeId = typeof LOCATION_REQUEST_TYPE_ID
export type LocationLevelId = (typeof LOCATION_LEVEL_IDS)[number]
export type LocationDocumentType = 'DNI' | 'CE' | 'PASAPORTE'

export type LocationRequestType = {
  id: LocationRequestTypeId
  name: string
  price: number
}

export type LocationLanguage = { id: number; name: string }
export type LocationText = { code: string; content: string }
export type LocationSchedule = {
  id: number
  moduleId: number
  moduleName: string
  scheduledAt: string
  active: boolean
}

export type LocationCatalogs = {
  requestType: LocationRequestType
  languages: LocationLanguage[]
  texts: LocationText[]
}

export type LocationBasicData = {
  languageId: number
  levelId: LocationLevelId
  names: string
  lastNames: string
  documentType: LocationDocumentType
  documentNumber: string
  phone: string
  identityDocumentUrl: string
  existingStudentId: string | null
}

export type LocationVoucher = {
  number: string
  paidAt: string
  url: string
}

export type LocationPayment =
  | { amount: 0; voucher: null }
  | { amount: number; voucher: LocationVoucher }

export type SolicitudUbicacion = {
  email: string
  isCiunacStudent: boolean
  basicData: LocationBasicData
  payment: LocationPayment
  studyCertificateUrl: string | null
}

export type LocationStudentLookup = {
  id: string
  names: string
  lastNames: string
  phone: string
}

export type ExistingLocationRequest = {
  statusId: number
  languageId: number
  requestTypeId: number
}

export type LocationCargo = {
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

export function isLocationLevel(value: number): value is LocationLevelId {
  return LOCATION_LEVEL_IDS.includes(value as LocationLevelId)
}

export function isOfficialLocationPrice(value: number): boolean {
  return Number.isFinite(value) && Math.round(value * 100) === Math.round(LOCATION_EXAM_PRICE * 100)
}

export function normalizeLocationDocumentNumber(value: string): string {
  return value.trim().toLocaleUpperCase()
}

export function isLocationDocumentNumber(value: string): boolean {
  return /^[A-Z0-9]{8,9}$/.test(value)
}
