import { type Payment, sameMoney } from '@/modules/shared/domain/payment'

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

export type LocationPayment = Payment

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
  return sameMoney(value, LOCATION_EXAM_PRICE)
}

export function normalizeLocationDocumentNumber(value: string): string {
  return value.trim().toLocaleUpperCase()
}

export function isLocationDocumentNumber(value: string): boolean {
  return /^[A-Z0-9]{8,9}$/.test(value)
}

export function isLocationDocument(type: LocationDocumentType, value: string): boolean {
  return type === 'DNI' ? /^\d{8}$/.test(value) : /^[A-Za-z0-9]{9}$/.test(value)
}

export function hasPendingLocationRequest(requests: ExistingLocationRequest[], languageId: number): boolean {
  return requests.some((request) => request.statusId === 1
    && request.languageId === languageId
    && request.requestTypeId === LOCATION_REQUEST_TYPE_ID)
}
