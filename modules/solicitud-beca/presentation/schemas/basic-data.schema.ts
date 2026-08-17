import { z } from 'zod'

const messages = {
  required: 'El campo es requerido',
  invalidLength: (length: number) => `Campo debe tener ${length} dígitos`,
}

export const basicInfoSchema = z.object({
  apellidos: z.string().min(2, messages.required).max(254).trim(),
  nombres: z.string().min(2, messages.required).max(254).trim(),
  facultad: z.string().regex(/^\d+$/, messages.required).trim(),
  escuela: z.string().regex(/^\d+$/, messages.required).trim(),
  direccion: z.string().max(500).trim(),
  codigo: z.string().min(1, messages.required).max(254).trim(),
  tipo_documento: z.enum(['DNI', 'CE', 'PASAPORTE']),
  celular: z.string().regex(/^\d{9}$/, messages.invalidLength(9)).trim(),
  dni: z.string().regex(/^[A-Za-z0-9]+$/).trim(),
}).strict().superRefine((data, context) => {
  const expectedLength = data.tipo_documento === 'DNI' ? 8 : 9
  if (data.dni.length !== expectedLength) {
    context.addIssue({
      code: 'custom',
      message: messages.invalidLength(expectedLength),
      path: ['dni'],
    })
  }
})

export type IBasicInfoSchema = z.infer<typeof basicInfoSchema>

export const initialValues: IBasicInfoSchema = {
  apellidos: '',
  nombres: '',
  facultad: '',
  escuela: '',
  direccion: '',
  codigo: '',
  tipo_documento: 'DNI',
  dni: '',
  celular: '',
}
