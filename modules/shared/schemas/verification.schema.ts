import { z } from 'zod'

const msg = {
  required: 'El campo es requerido',
  invalid: (length: number) => `Campo debe tener ${length} digitos`,
}

export const verificationSchema = z.object({
  email: z.string().trim().min(1, msg.required).email('Ingrese un correo electronico valido'),
  code: z.string().length(6, msg.invalid(6)).regex(/^\d{6}$/, msg.invalid(6)),
})

export type IVerificationSchema = z.infer<typeof verificationSchema>

export const initialValues: IVerificationSchema = {
  email: '',
  code: '',
}
