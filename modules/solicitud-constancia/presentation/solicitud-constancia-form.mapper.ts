import { AppError } from '@/modules/shared/application/errors/app-error'
import type { IFinInfoSchema } from '@/modules/shared/schemas/fin-data.schema'
import {
  isConstanciaLevel,
  type ConstanciaBasicData,
  type ConstanciaCatalogs,
  type ConstanciaPayment,
} from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import {
  constanciaBasicDataInitialValues,
  type ConstanciaBasicDataFormValues,
} from '@/modules/solicitud-constancia/presentation/schemas/basic-data.schema'

export function toConstanciaBasicData(
  values: ConstanciaBasicDataFormValues,
  catalogs: ConstanciaCatalogs,
): ConstanciaBasicData {
  const typeId = Number(values.tipo_solicitud)
  const languageId = Number(values.idioma)
  const levelId = Number(values.nivel)
  const requestType = catalogs.requestTypes.find((item) => item.id === typeId)
  const language = catalogs.languages.find((item) => item.id === languageId)
  if (!requestType || !language || !isConstanciaLevel(levelId)) {
    throw new AppError({
      code: 'VALIDATION',
      status: 400,
      message: 'La constancia, idioma o nivel seleccionado no es valido.',
    })
  }

  const common = {
    typeId: requestType.id,
    languageId: language.id,
    levelId,
    names: values.nombres,
    lastNames: values.apellidos,
    documentType: values.tipo_documento,
    documentNumber: values.dni.toLocaleUpperCase(),
    phone: values.celular,
    existingStudentId: values.estudianteId || null,
  }
  if (!values.estudiante) return { ...common, isUnacStudent: false }

  const facultyId = Number(values.facultad)
  const schoolId = Number(values.escuela)
  const faculty = catalogs.faculties.find((item) => item.id === facultyId)
  const school = catalogs.schools.find((item) => item.id === schoolId)
  if (!faculty || !school || school.facultyId !== faculty.id) {
    throw new AppError({
      code: 'VALIDATION',
      status: 400,
      message: 'La facultad o escuela seleccionada no es valida.',
    })
  }

  return {
    ...common,
    isUnacStudent: true,
    facultyId: faculty.id,
    schoolId: school.id,
    studentCode: values.codigo,
  }
}

export function toConstanciaPayment(values: IFinInfoSchema, expectedPrice: number): ConstanciaPayment {
  const amount = Number(values.pago)
  if (!sameMoney(amount, expectedPrice)) {
    throw new AppError({
      code: 'VALIDATION',
      status: 409,
      message: 'El tarifario cambio. Revise nuevamente el monto antes de continuar.',
    })
  }
  if (amount === 0) return { amount: 0, voucher: null }

  const number = values.numero_voucher?.trim()
  const paidAt = values.fecha_pago?.toISOString()
  const url = values.img_voucher?.trim()
  if (!number || !paidAt || !url) {
    throw new AppError({ code: 'VALIDATION', status: 400, message: 'Los datos del voucher estan incompletos.' })
  }
  return { amount, voucher: { number, paidAt, url } }
}

export function toConstanciaBasicFormValues(data: ConstanciaBasicData | null): ConstanciaBasicDataFormValues {
  if (!data) return { ...constanciaBasicDataInitialValues }
  return {
    tipo_solicitud: String(data.typeId),
    apellidos: data.lastNames,
    nombres: data.names,
    idioma: String(data.languageId),
    nivel: String(data.levelId),
    tipo_documento: data.documentType,
    celular: data.phone,
    dni: data.documentNumber,
    estudianteId: data.existingStudentId ?? '',
    estudiante: data.isUnacStudent,
    facultad: data.isUnacStudent ? String(data.facultyId) : '',
    escuela: data.isUnacStudent ? String(data.schoolId) : '',
    codigo: data.isUnacStudent ? data.studentCode : '',
  }
}

export function toConstanciaPaymentFormValues(payment: ConstanciaPayment | null): Partial<IFinInfoSchema> {
  return {
    pago: String(payment?.amount ?? 0),
    numero_voucher: payment?.voucher?.number ?? '',
    fecha_pago: payment?.voucher?.paidAt ? new Date(payment.voucher.paidAt) : undefined,
    img_voucher: payment?.voucher?.url ?? '',
  }
}

export function findConstanciaPrice(typeId: number | undefined, catalogs: ConstanciaCatalogs): number {
  return catalogs.requestTypes.find((item) => item.id === typeId)?.price ?? 0
}

function sameMoney(left: number, right: number): boolean {
  return Number.isFinite(left) && Number.isFinite(right) && Math.round(left * 100) === Math.round(right * 100)
}
