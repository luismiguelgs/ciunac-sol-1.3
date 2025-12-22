import { z } from "zod"

export const documentsSchema = z.object({
    constancia_matricula: z.string().url("Debes subir un archivo").min(1, "Documento requerido"),
    historial_academico: z.string().url("Debes subir un archivo").min(1, "Documento requerido"),
    constancia_tercio: z.string().url("Debes subir un archivo").min(1, "Documento requerido"),
    carta_compromiso: z.string().url("Debes subir un archivo").min(1, "Documento requerido"),
    declaracion_jurada: z.string().url("Debes subir un archivo").min(1, "Documento requerido"),
});

export type DocumentsFormValues = z.infer<typeof documentsSchema>;