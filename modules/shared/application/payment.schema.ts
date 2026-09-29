import { z } from 'zod'
import type { Payment } from '../domain/payment'

export const paymentSchema: z.ZodType<Payment> = z.union([
  z.object({ amount: z.literal(0), voucher: z.null() }).strict(),
  z.object({
    amount: z.number().positive(),
    voucher: z.object({
      number: z.string().regex(/^\d{15}$/),
      paidAt: z.string().datetime(),
      url: z.string().trim().min(1).max(2048),
    }).strict(),
  }).strict(),
])
