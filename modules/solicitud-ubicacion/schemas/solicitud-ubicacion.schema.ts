import {z} from "zod";

export const solicitudUbicacionSchema = z.object({
    trabajador: z.boolean(),
    alumno_ciunac: z.boolean(),
    tipo_trabajador: z.string().trim(),
}).superRefine((data, ctx) => {
    if (data.trabajador && !data.tipo_trabajador) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El tipo de trabajador es obligatorio si seleccionó trabajador UNAC.",
            path: ["tipo_trabajador"]
        });
    }
});

export type IsolicitudUbicacionSchema = z.infer<typeof solicitudUbicacionSchema>;

export const initialValues:IsolicitudUbicacionSchema = {
    trabajador: false,
    alumno_ciunac: false,
    tipo_trabajador: "",
};
