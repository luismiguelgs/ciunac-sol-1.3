import { z } from 'zod'

export const locationDocumentsFormSchema = z.object({
  studyCertificateUrl: z.string().trim().min(1, 'Debe cargar el certificado de estudios CIUNAC.').max(2048),
}).strict()

export type LocationDocumentsFormValues = z.infer<typeof locationDocumentsFormSchema>
