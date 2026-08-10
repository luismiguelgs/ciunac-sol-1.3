import {z} from "zod";

const msg = {
	required: "El campo es requerido",
	invalid: (n:number) => `Campo debe tener ${n} digitos`,
}

export const basicInfoSchema = z.object({
    apellidos: z.string().min(2,msg.required).max(254).trim(),
    nombres: z.string().min(2,msg.required).max(254).trim(),
    facultad: z.string().regex(/^\d+$/, msg.required).trim(),
    escuela: z.string().regex(/^\d+$/, msg.required).trim(),
    direccion: z.string().max(500).trim(),
    codigo: z.string().min(1,msg.required).max(254).trim(),
    tipo_documento: z.enum(["DNI","CE","PASAPORTE"]),
    celular: z.string().regex(/^\d{9}$/, msg.invalid(9)).trim(),
    dni: z.string().regex(/^[A-Za-z0-9]+$/).trim()
}).strict().superRefine((data, ctx) => {
	const reqLength = data.tipo_documento === "DNI" ? 8 : 9;
	if(data.dni.length !== reqLength) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message: msg.invalid(reqLength),
		path: ["dni"]
	})	
})

export type IBasicInfoSchema = z.infer<typeof basicInfoSchema>;

export const initialValues:IBasicInfoSchema = {
    apellidos: "",
    nombres: "",
    facultad: "",
    escuela: "",
    direccion: "",
    codigo: "",
    tipo_documento: "DNI",
    dni: "",
    celular: "",
}
