import { z } from "zod";

const msg = {
    required: "El campo es requerido",
    invalid: (n: number) => `Campo debe tener ${n} digitos`,
}

export const basicInfoSchema = z.object({
    firstLastname: z.string().min(2, msg.required).trim(),
    secondLastname: z.string().min(2, msg.required).trim(),
    firstName: z.string().min(2, msg.required).trim(),
    secondName: z.string().trim(),
    code_program: z.string().min(1, msg.required).trim(),
    birth_date: z.date().refine((val) => !!val, { message: msg.required }),
    gender: z.enum(["M", "F"]),
    document_type: z.enum(["PE01", "PE02"]),
    phone: z.string().min(9, msg.required).max(9, msg.invalid(9)).trim(),
    document: z.string().trim()
}).superRefine((data, ctx) => {
    const reqLength = data.document_type === "PE01" ? 8 : 9;
    if (data.document.length !== reqLength) ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: msg.invalid(reqLength),
        path: ["document"]
    })
})

export type IBasicInfoSchema = z.infer<typeof basicInfoSchema>;

export const initialValues: IBasicInfoSchema = {
    firstLastname: "",
    code_program: "",
    secondLastname: "",
    firstName: "",
    birth_date: new Date(),
    secondName: "",
    gender: "F",
    document_type: "PE01",
    phone: "",
    document: "",
}
