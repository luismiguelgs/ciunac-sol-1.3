import {z} from "zod";

const msg = {
	required: "El campo es requerido",
	invalid: (n:number) => `Campo debe tener ${n} digitos`,
    emailRegex: /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/
}

export const verificationSchema = z.object({
    email: z.string().min(1,msg.required).email('Ingrese un correo electrónico válido').regex(msg.emailRegex),
    code: z.string().min(4,msg.invalid(4)).max(4,msg.invalid(4))
})


export type IVerificationSchema = z.infer<typeof verificationSchema>;

export const initialValues:IVerificationSchema = {
    email: "",
    code: ""
}
