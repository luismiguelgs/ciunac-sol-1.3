import { z } from 'zod'

export const finalSchema = z.object({
  info: z.boolean().refine(Boolean, 'Debe confirmar que los datos son correctos.'),
  terminos: z.boolean().refine(Boolean, 'Debe aceptar los terminos y condiciones.'),
})

export type IFinalSchema = z.infer<typeof finalSchema>

export const initialValues: IFinalSchema = {
  info: false,
  terminos: false,
}
