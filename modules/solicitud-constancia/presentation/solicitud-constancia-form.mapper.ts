import { AppError } from '@/modules/shared/application/errors/app-error'
import { IFinInfoSchema } from '@/modules/shared/schemas/fin-data.schema'
import {
  ConstanciaBasicData,
  ConstanciaPayment,
  isConstanciaType,
} from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import { ConstanciaBasicDataValues } from '@/modules/solicitud-constancia/schemas/basic-data.schema'

export function toConstanciaBasicData(values: ConstanciaBasicDataValues): ConstanciaBasicData {
  const typeId = Number(values.tipo_solicitud)
  if (!isConstanciaType(typeId)) {
    throw new AppError({ code: 'VALIDATION', status: 400, message: 'El tipo de constancia no es valido.' })
  }

  const common = {
    typeId,
    languageId: Number(values.idioma),
    levelId: Number(values.nivel),
    names: values.nombres,
    lastNames: values.apellidos,
    documentType: values.tipo_documento,
    documentNumber: values.dni,
    phone: values.celular,
    existingStudentId: values.estudianteId || null,
  }

  if (!values.estudiante) return { ...common, isUnacStudent: false }

  return {
    ...common,
    isUnacStudent: true,
    facultyId: Number(values.facultad),
    schoolId: Number(values.escuela),
    studentCode: values.codigo ?? '',
  }
}

export function toConstanciaPayment(values: IFinInfoSchema): ConstanciaPayment {
  const amount = Number(values.pago)
  if (!Number.isFinite(amount) || amount < 0) {
    throw new AppError({ code: 'VALIDATION', status: 400, message: 'El monto de pago no es valido.' })
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
