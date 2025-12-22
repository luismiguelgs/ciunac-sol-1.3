import {z} from "zod";

export const finalSchema = z.object({
    info: z.boolean(),
    terminos: z.boolean(),
})

export type IFinalSchema = z.infer<typeof finalSchema>;

export const initialValues:IFinalSchema = {
    info: false,
    terminos: false
}
