import { z } from 'zod'
import {
  Q10ProgramResponseDto,
  Q10RegistrationResponseDto,
  Q10StudentRequestDto,
} from '@/modules/solicitud-nuevo/infrastructure/dto/q10-api.dto'

export const q10ProgramArraySchema: z.ZodType<Q10ProgramResponseDto[]> = z.array(z.object({
  Codigo: z.string().trim().min(1).max(80),
  Nombre: z.string().trim().min(1).max(254),
  Numero_resolucion: z.string().nullable(),
}).passthrough())

export const q10StudentRequestSchema: z.ZodType<Q10StudentRequestDto> = z.object({
  Primer_apellido: z.string().trim().min(2).max(80),
  Segundo_apellido: z.string().trim().min(2).max(80),
  Primer_nombre: z.string().trim().min(2).max(80),
  Segundo_nombre: z.string().trim().min(1).max(80).optional(),
  Email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  Codigo_tipo_identificacion: z.enum(['PE01', 'PE02']),
  Numero_identificacion: z.string().trim().max(9),
  Genero: z.enum(['F', 'M']),
  Fecha_nacimiento: z.string().datetime(),
  Telefono: z.string().regex(/^\d{9}$/),
  Celular: z.string().regex(/^\d{9}$/),
  Codigo_programa: z.string().trim().min(1).max(80),
}).strict().superRefine((data, context) => {
  const validDocument = data.Codigo_tipo_identificacion === 'PE01'
    ? /^\d{8}$/.test(data.Numero_identificacion)
    : /^[A-Za-z0-9]{9}$/.test(data.Numero_identificacion)
  if (!validDocument) {
    context.addIssue({ code: 'custom', path: ['Numero_identificacion'], message: 'Invalid document' })
  }
})

export const q10RegistrationResponseSchema: z.ZodType<Q10RegistrationResponseDto> = z.record(
  z.string(),
  z.unknown(),
)
