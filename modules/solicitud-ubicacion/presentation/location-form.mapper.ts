import { AppError } from '@/modules/shared/application/errors/app-error'
import { IFinInfoSchema } from '@/modules/shared/schemas/fin-data.schema'
import {
  LOCATION_EXAM_PRICE,
  LocationBasicData,
  LocationCatalogs,
  LocationPayment,
  isLocationLevel,
} from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import {
  LocationBasicDataFormValues,
  locationBasicDataInitialValues,
} from '@/modules/solicitud-ubicacion/presentation/schemas/location-basic-data.schema'

export function toLocationBasicData(
  values: LocationBasicDataFormValues,
  catalogs: LocationCatalogs,
  isCiunacStudent: boolean,
): LocationBasicData {
  const languageId = Number(values.idioma)
  const levelId = Number(values.nivel)
  const language = catalogs.languages.find((item) => item.id === languageId)
  if (!language || !isLocationLevel(levelId) || (!isCiunacStudent && levelId !== 1)) {
    throw new AppError({ code: 'VALIDATION', status: 400, message: 'El idioma o nivel seleccionado no es valido.' })
  }

  return {
    languageId: language.id,
    levelId,
    names: values.nombres,
    lastNames: values.apellidos,
    documentType: values.tipo_documento,
    documentNumber: values.dni.toLocaleUpperCase(),
    phone: values.celular,
    identityDocumentUrl: values.img_dni,
    existingStudentId: values.estudianteId || null,
  }
}

export function toLocationPayment(values: IFinInfoSchema): LocationPayment {
  const amount = Number(values.pago)
  if (!sameMoney(amount, LOCATION_EXAM_PRICE)) {
    throw new AppError({
      code: 'VALIDATION',
      status: 409,
      message: 'El tarifario cambio. Revise nuevamente el monto antes de continuar.',
    })
  }
  const number = values.numero_voucher?.trim()
  const paidAt = values.fecha_pago?.toISOString()
  const url = values.img_voucher?.trim()
  if (!number || !paidAt || !url) {
    throw new AppError({ code: 'VALIDATION', status: 400, message: 'Los datos del voucher estan incompletos.' })
  }
  return { amount, voucher: { number, paidAt, url } }
}

export function toLocationBasicFormValues(data: LocationBasicData | null): LocationBasicDataFormValues {
  if (!data) return { ...locationBasicDataInitialValues }
  return {
    idioma: String(data.languageId),
    nivel: String(data.levelId),
    apellidos: data.lastNames,
    nombres: data.names,
    img_dni: data.identityDocumentUrl,
    tipo_documento: data.documentType,
    dni: data.documentNumber,
    celular: data.phone,
    estudianteId: data.existingStudentId ?? '',
  }
}

export function toLocationPaymentFormValues(payment: LocationPayment | null): Partial<IFinInfoSchema> {
  return {
    pago: String(payment?.amount ?? LOCATION_EXAM_PRICE),
    numero_voucher: payment?.voucher?.number ?? '',
    fecha_pago: payment?.voucher?.paidAt ? new Date(payment.voucher.paidAt) : undefined,
    img_voucher: payment?.voucher?.url ?? '',
  }
}

function sameMoney(left: number, right: number): boolean {
  return Number.isFinite(left) && Math.round(left * 100) === Math.round(right * 100)
}
