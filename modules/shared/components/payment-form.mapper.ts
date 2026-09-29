import { AppError } from '../application/errors/app-error'
import type { Payment } from '../domain/payment'
import type { IFinInfoSchema } from '../schemas/fin-data.schema'

export function toPayment(values: IFinInfoSchema): Payment {
  const amount = Number(values.pago)
  if (!values.pago.trim() || !Number.isFinite(amount) || amount < 0) {
    throw new AppError({ code: 'VALIDATION', status: 400, message: 'El monto de pago no es valido.' })
  }
  if (amount === 0) return { amount: 0, voucher: null }

  const number = values.numero_voucher?.trim()
  const date = values.fecha_pago
  const url = values.img_voucher?.trim()
  if (!number || !date || !Number.isFinite(date.getTime()) || !url) {
    throw new AppError({ code: 'VALIDATION', status: 400, message: 'Los datos del voucher estan incompletos.' })
  }
  return { amount, voucher: { number, paidAt: date.toISOString(), url } }
}

export function toPaymentFormValues(payment: Payment | null, defaultAmount = 0): Partial<IFinInfoSchema> {
  return {
    pago: String(payment?.amount ?? defaultAmount),
    numero_voucher: payment?.voucher?.number ?? '',
    fecha_pago: payment?.voucher?.paidAt ? new Date(payment.voucher.paidAt) : undefined,
    img_voucher: payment?.voucher?.url ?? '',
  }
}
