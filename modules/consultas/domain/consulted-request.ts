import { AppError } from '@/modules/shared/application/errors/app-error'

export type ConsultationType = 'CERTIFICADO' | 'EXAMEN'
export type ConsultedRequestKind = 'certificate' | 'constancia' | 'location' | 'other'
export type ConsultedRequestStep = 'registered' | 'processing' | 'ready' | 'rejected'

export type ConsultedRequest = {
  id: number
  student: {
    id: string
    names: string
    lastNames: string
    documentNumber: string
  }
  requestType: {
    id: number
    name: string
    kind: ConsultedRequestKind
  }
  language: { id: number; name: string }
  level: { id: number; name: string }
  status: {
    id: number
    name: string
    reference: string
    step: ConsultedRequestStep
  }
  createdAt: string
  digital: boolean
  observations: string | null
  payment: {
    amount: number
    voucherNumber: string | null
    paidAt: string | null
  }
}

export function normalizeConsultationDocument(value: string): string {
  const documentNumber = value.trim().toUpperCase()
  if (!/^[A-Z0-9]{8,9}$/.test(documentNumber)) {
    throw new AppError({
      code: 'VALIDATION',
      status: 400,
      message: 'El numero de documento no es valido.',
    })
  }
  return documentNumber
}

export function resolveRequestKind(typeId: number, typeName: string): ConsultedRequestKind {
  if (typeId === 5 || typeId === 6) return 'constancia'
  if (typeId === 7 || normalizeText(typeName).includes('UBICACION')) return 'location'
  if ([1, 2, 3, 4].includes(typeId) || normalizeText(typeName).includes('CERTIFICADO')) return 'certificate'
  return 'other'
}

export function resolveRequestStep(statusId: number, statusName: string): ConsultedRequestStep {
  const name = normalizeText(statusName)
  if (statusId === 5 || name === 'RECHAZADO') return 'rejected'
  if (statusId === 1 || name === 'NUEVO') return 'registered'
  if (statusId === 3 || name === 'PARA RECOGER' || name === 'ENTREGADO') return 'ready'
  return 'processing'
}

export function matchesConsultationType(request: ConsultedRequest, type: ConsultationType): boolean {
  return type === 'EXAMEN'
    ? request.requestType.kind === 'location'
    : request.requestType.kind !== 'location'
}

function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase()
}
