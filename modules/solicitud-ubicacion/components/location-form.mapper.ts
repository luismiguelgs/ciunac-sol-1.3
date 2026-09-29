import { toPayment, toPaymentFormValues } from '@/modules/shared/components/payment-form.mapper'
import { AppError } from '@/modules/shared/application/errors/app-error'
import { IFinInfoSchema } from '@/modules/shared/schemas/fin-data.schema'
import {
  LOCATION_EXAM_PRICE,
  LocationBasicData,
  LocationCatalogs,
  LocationPayment,
  isLocationLevel,
  isOfficialLocationPrice,
  type SolicitudUbicacion,
} from '../model'
import type { LocationDraft } from '../store'
import {
  LocationBasicDataFormValues,
  locationBasicDataInitialValues,
} from './location-basic-data.schema'

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
  if (!isOfficialLocationPrice(amount)) {
    throw new AppError({
      code: 'VALIDATION',
      status: 409,
      message: 'El tarifario cambio. Revise nuevamente el monto antes de continuar.',
    })
  }
  return toPayment(values)
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
  return toPaymentFormValues(payment, LOCATION_EXAM_PRICE)
}

export function toCompleteLocationRequest(draft: LocationDraft): SolicitudUbicacion | null {
  const { email, isCiunacStudent, basicData, payment, studyCertificateUrl } = draft
  if (!email || !basicData || !payment || (isCiunacStudent && !studyCertificateUrl)) return null
  return { email, isCiunacStudent, basicData, payment, studyCertificateUrl }
}
