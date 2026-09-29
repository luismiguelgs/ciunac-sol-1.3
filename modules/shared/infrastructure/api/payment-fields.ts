import { z } from 'zod'
import type { Payment } from '../../domain/payment'

export const paymentRequestFields = {
  pago: z.number().nonnegative(),
  fechaPago: z.string().datetime().optional(),
  numeroVoucher: z.string().regex(/^\d{15}$/).optional(),
  imgVoucher: z.string().trim().min(1).max(2048).refine(
    (value) => value.startsWith('/') || /^https?:\/\//i.test(value),
  ).optional(),
}

type PaymentRequestFields = z.output<z.ZodObject<typeof paymentRequestFields>>

export function validatePaymentRequest(data: PaymentRequestFields, context: z.RefinementCtx): void {
  if (data.pago <= 0) return
  if (!data.fechaPago) context.addIssue({ code: 'custom', path: ['fechaPago'], message: 'Payment date is required' })
  if (!data.numeroVoucher) context.addIssue({ code: 'custom', path: ['numeroVoucher'], message: 'Voucher number is required' })
  if (!data.imgVoucher) context.addIssue({ code: 'custom', path: ['imgVoucher'], message: 'Voucher file is required' })
}

export function toPaymentRequestFields(payment: Payment): PaymentRequestFields {
  return {
    pago: payment.amount,
    fechaPago: payment.voucher?.paidAt,
    numeroVoucher: payment.voucher?.number,
    imgVoucher: payment.voucher?.url,
  }
}
