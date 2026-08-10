import { z } from 'zod'

const required = 'El campo es requerido'
const positiveId = z.string().trim().regex(/^\d+$/, required).refine((value) => Number(value) > 0, required)

export const constanciaBasicDataSchema = z.object({
  tipo_solicitud: z.enum(['5', '6']),
  apellidos: z.string().trim().min(2, required),
  nombres: z.string().trim().min(2, required),
  idioma: positiveId,
  nivel: positiveId,
  tipo_documento: z.enum(['DNI', 'CE', 'PASAPORTE']),
  celular: z.string().trim().regex(/^\d{9}$/, 'El celular debe tener 9 digitos'),
  dni: z.string().trim().min(8, required),
  estudianteId: z.string().optional(),
  estudiante: z.boolean(),
  facultad: z.string().trim().optional(),
  escuela: z.string().trim().optional(),
  codigo: z.string().trim().optional(),
}).superRefine((data, ctx) => {
  const documentLength = data.tipo_documento === 'DNI' ? 8 : 9
  if (data.dni.length !== documentLength) {
    ctx.addIssue({
      code: 'custom',
      message: `El documento debe tener ${documentLength} caracteres`,
      path: ['dni'],
    })
  }

  if (!data.estudiante) return
  for (const field of ['facultad', 'escuela', 'codigo'] as const) {
    if (!data[field]) {
      ctx.addIssue({ code: 'custom', message: required, path: [field] })
    }
  }
  for (const field of ['facultad', 'escuela'] as const) {
    if (data[field] && (!/^\d+$/.test(data[field]) || Number(data[field]) <= 0)) {
      ctx.addIssue({ code: 'custom', message: required, path: [field] })
    }
  }
})

export type ConstanciaBasicDataValues = z.infer<typeof constanciaBasicDataSchema>

export const constanciaBasicDataInitialValues: ConstanciaBasicDataValues = {
  tipo_solicitud: '5',
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
