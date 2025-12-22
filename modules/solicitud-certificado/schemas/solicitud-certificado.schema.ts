import {z} from "zod";

export const solicitudCertificadoSchema = z.object({
    trabajador: z.boolean(),
    antiguo: z.boolean(),
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

export type IsolicitudCertificadoSchema = z.infer<typeof solicitudCertificadoSchema>;

export const initialValues:IsolicitudCertificadoSchema = {
    trabajador: false,
    antiguo: false,
    tipo_trabajador: "",
};
