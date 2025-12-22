import { z } from "zod";

const msgReq = 'Campo requerido';

const finInfoSchema = z.object({
    pago: z.string().min(1, msgReq).trim(),
    numero_voucher: z.string().trim().optional().nullable(),
    fecha_pago: z.date().optional().nullable(),
    img_voucher: z.string().nullable()
}).superRefine((data, ctx) => {
    if (data.pago !== '0') {
        if (!data.numero_voucher) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: msgReq,
                path: ['numero_voucher']
            });
        }
        if (!data.fecha_pago) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: msgReq,
                path: ['fecha_pago']
            });
        }
    }
});

export type IFinInfoSchema = z.infer<typeof finInfoSchema>;

const initialValues:IFinInfoSchema = {
    pago: '0',
    numero_voucher: '',
    fecha_pago: new Date(),
    img_voucher: ''
};

export { finInfoSchema, initialValues };