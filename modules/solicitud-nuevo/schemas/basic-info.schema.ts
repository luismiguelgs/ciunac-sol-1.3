import { z } from 'zod'

const required = 'El campo es requerido'

export const basicInfoSchema = z.object({
  firstLastname: z.string().trim().min(2, required).max(80),
  secondLastname: z.string().trim().min(2, required).max(80),
  firstName: z.string().trim().min(2, required).max(80),
  secondName: z.string().trim().max(80),
  code_program: z.string().trim().min(1, required).max(80),
  birth_date: z.date().refine((value) => value <= new Date(), {
    message: 'La fecha de nacimiento no puede ser futura',
  }),
  gender: z.enum(['M', 'F']),
  document_type: z.enum(['DNI', 'CE']),
  phone: z.string().trim().regex(/^\d{9}$/, 'El telefono debe tener 9 digitos'),
  document: z.string().trim(),
}).superRefine((data, context) => {
  const valid = data.document_type === 'DNI'
    ? /^\d{8}$/.test(data.document)
    : /^[A-Za-z0-9]{9}$/.test(data.document)
  if (!valid) {
    context.addIssue({
      code: 'custom',
      message: data.document_type === 'DNI'
        ? 'El DNI debe tener 8 digitos'
        : 'El carnet de extranjeria debe tener 9 caracteres alfanumericos',
      path: ['document'],
    })
  }
})

export type IBasicInfoSchema = z.infer<typeof basicInfoSchema>

export const initialValues = {
  firstLastname: '',
  secondLastname: '',
  firstName: '',
  secondName: '',
  code_program: '',
  birth_date: undefined,
  gender: 'F' as const,
  document_type: 'DNI' as const,
  phone: '',
  document: '',
}
