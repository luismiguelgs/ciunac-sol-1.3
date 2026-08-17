import { z } from 'zod'

const required = 'El campo es requerido'

export const constanciaBasicDataFormSchema = z.object({
  tipo_solicitud: z.string().trim().regex(/^[56]$/, 'Seleccione una constancia valida.'),
  apellidos: z.string().trim().min(2, required).max(80),
  nombres: z.string().trim().min(2, required).max(80),
  idioma: z.string().trim().regex(/^[1-9]\d*$/, required),
  nivel: z.string().trim().regex(/^[1-9]\d*$/, required),
  tipo_documento: z.enum(['DNI', 'CE', 'PASAPORTE']),
  celular: z.string().trim().regex(/^\d{9}$/, 'El celular debe tener 9 digitos.'),
  dni: z.string().trim().regex(/^[A-Za-z0-9]{8,9}$/, 'El documento no es valido.'),
  estudianteId: z.string().trim(),
  estudiante: z.boolean(),
  facultad: z.string().trim(),
  escuela: z.string().trim(),
  codigo: z.string().trim(),
}).strict().superRefine((data, context) => {
  const expectedLength = data.tipo_documento === 'DNI' ? 8 : 9
  if (data.dni.length !== expectedLength) {
    context.addIssue({ code: 'custom', message: `El documento debe tener ${expectedLength} caracteres.`, path: ['dni'] })
  }
  if (!data.estudiante) return
  if (!data.facultad) context.addIssue({ code: 'custom', message: required, path: ['facultad'] })
  if (!data.escuela) context.addIssue({ code: 'custom', message: required, path: ['escuela'] })
  if (!data.codigo) context.addIssue({ code: 'custom', message: required, path: ['codigo'] })
})

export type ConstanciaBasicDataFormValues = z.infer<typeof constanciaBasicDataFormSchema>

export const constanciaBasicDataInitialValues: ConstanciaBasicDataFormValues = {
  tipo_solicitud: '',
  apellidos: '',
  nombres: '',
  idioma: '',
  nivel: '',
  tipo_documento: 'DNI',
  celular: '',
  dni: '',
  estudianteId: '',
  estudiante: false,
  facultad: '',
  escuela: '',
  codigo: '',
}
