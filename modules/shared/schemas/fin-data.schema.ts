import { z } from 'zod'

const requiredMessage = 'Campo requerido'

export const finInfoSchema = z.object({
  pago: z.string().trim().min(1, requiredMessage),
  numero_voucher: z.string().trim().optional().nullable(),
  fecha_pago: z.date().optional().nullable(),
  img_voucher: z.string().trim().optional().nullable(),
}).superRefine((data, ctx) => {
  if (Number(data.pago) <= 0) return

  const voucherNumber = data.numero_voucher?.trim()
  if (!voucherNumber) {
    ctx.addIssue({ code: 'custom', message: requiredMessage, path: ['numero_voucher'] })
  } else if (!/^\d{15}$/.test(voucherNumber)) {
    ctx.addIssue({
      code: 'custom',
      message: 'El numero de voucher debe tener exactamente 15 digitos.',
      path: ['numero_voucher'],
    })
  }

  if (!data.fecha_pago) {
    ctx.addIssue({ code: 'custom', message: requiredMessage, path: ['fecha_pago'] })
  }
  if (!data.img_voucher?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'Debe cargar el voucher de pago.', path: ['img_voucher'] })
  }
})

export type IFinInfoSchema = z.infer<typeof finInfoSchema>

export const initialValues: IFinInfoSchema = {
  pago: '0',
  numero_voucher: '',
  fecha_pago: new Date(),
  img_voucher: '',
}
