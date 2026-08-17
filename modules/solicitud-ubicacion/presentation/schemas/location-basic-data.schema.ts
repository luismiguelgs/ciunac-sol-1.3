import { z } from 'zod'

const required = 'El campo es requerido.'

export const locationBasicDataFormSchema = z.object({
  apellidos: z.string().trim().min(2, required).max(80),
  nombres: z.string().trim().min(2, required).max(80),
  idioma: z.string().trim().regex(/^[1-9]\d*$/, required),
  nivel: z.string().trim().regex(/^[1-3]$/, 'Seleccione un nivel valido.'),
  img_dni: z.string().trim().min(1, 'Debe cargar su documento de identidad.').max(2048),
  tipo_documento: z.enum(['DNI', 'CE', 'PASAPORTE']),
  celular: z.string().trim().regex(/^\d{9}$/, 'El celular debe tener 9 digitos.'),
  dni: z.string().trim().regex(/^[A-Za-z0-9]{8,9}$/, 'El documento no es valido.'),
  estudianteId: z.string().trim(),
}).strict().superRefine((data, context) => {
  const expectedLength = data.tipo_documento === 'DNI' ? 8 : 9
  if (data.dni.length !== expectedLength) {
    context.addIssue({
      code: 'custom',
      message: `El documento debe tener ${expectedLength} caracteres.`,
      path: ['dni'],
    })
  }
})

export type LocationBasicDataFormValues = z.infer<typeof locationBasicDataFormSchema>

export const locationBasicDataInitialValues: LocationBasicDataFormValues = {
  idioma: '',
  nivel: '1',
  apellidos: '',
  nombres: '',
  img_dni: '',
  tipo_documento: 'DNI',
  dni: '',
  celular: '',
  estudianteId: '',
}
