'use client'
import React from "react"
import { Button } from "@/components/ui/button"
import InputField from "@/components/forms/input.field"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import ReCAPTCHA from "react-google-recaptcha"
import { useMask } from '@react-input/mask';
import { MyAlertDialog } from "@/components/dialogs/alert-dialog"
import { useRouter } from "next/navigation"
import { consultByDocument } from '@/modules/security/client/security-client'

const msg = {
	required: "El número de documento es requerido",
	invalid: "Ingresar un número de documento válido",
}

const alert = {
	captcha: {
		title: "Captcha es un campo requerido",
		description: "Ingresar el captcha para continuar.",
	},
	notFound: {
		title: "Busqueda no encontrada",
		description: "No se encontró la solicitud, verificar el número de documento.",
	}
}

const schema = z.object({
	documento: z.string().min(8, { message: msg.required })
		.max(9, { message: msg.invalid })
		.regex(/^[A-Za-z0-9]+$/, { message: msg.invalid })
		.trim()
		.transform((val) => val.toUpperCase())
})

type Props = {
	solicitud: 'CERTIFICADO' | 'EXAMEN'
}

export default function ConsultaForm({ solicitud }: Props) {
	const router = useRouter()
	const [loading, setLoading] = React.useState(false)
	const [dialog, setDialog] = React.useState<{ title: string; description: string; } | null>(null)
	const [open, setOpen] = React.useState(false)
	const captchaRef = React.useRef<ReCAPTCHA>(null)
	const dniRef = useMask({ mask: '_________', replacement: { _: /[A-Za-z0-9]/ } });

	const form = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			documento: "",
		},
	})

	const onSubmit = async (data: z.infer<typeof schema>) => {
		const captchaToken = captchaRef.current?.getValue()
		if (!captchaToken) {
			setOpen(true)
			setDialog(alert.captcha)
			return
		}

		setLoading(true)
		try {
			const result = await consultByDocument(data.documento, solicitud, captchaToken)
			if (!result.found) {
				setOpen(true)
				setDialog(alert.notFound)
				return
			}

			if (solicitud === 'CERTIFICADO') {
				router.push(`./consulta-solicitud/${data.documento}`)
			} else {
				router.push(`./consulta-ubicacion/${data.documento}`)
			}
		} catch (error) {
			setOpen(true)
			setDialog({
				title: 'No se pudo realizar la consulta',
				description: error instanceof Error ? error.message : 'Intente nuevamente más tarde.',
			})
		} finally {
			captchaRef.current?.reset()
			setLoading(false)
		}
	}

	return (
		<React.Fragment>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="flex flex-col items-center gap-2 text-center">
						<h1 className="text-3xl font-bold">Consulta de Solicitud de {solicitud === 'EXAMEN' ? 'EXAMEN DE UBICACIÓN' : 'CERTIFICADO'}</h1>
						<p className="text-balance text-sm text-muted-foreground">
							Ingresar su Documento de Identidad, y verficar si esta listo para recoger su certificado
						</p>
					</div>
					<div className="grid gap-6 mt-4">
						<div className="grid gap-5">
							<InputField
								name="documento"
								label="Documento de Identidad"
								description="Ingrese su Documento de Identidad (DNI/CE/PASAPORTE)"
								placeholder="4025..."
								control={form.control}
								disabled={loading}
								inputRef={dniRef}
							/>
							<div className="flex justify-center w-full">
								<ReCAPTCHA
									sitekey={String(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)}
									ref={captchaRef}
									size="normal"
								/>
							</div>
						</div>
						{
							loading ? (
								<Button disabled className="min-w-[120px] w-full">
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Cargando...
								</Button>
							) : (
								<Button type="submit" className="w-full">Buscar</Button>
							)
						}
					</div>
				</form>
			</Form>
			<MyAlertDialog
				open={open}
				onOpenChange={setOpen}
				title={dialog?.title as string}
				description={dialog?.description as string}
			/>
		</React.Fragment>
	)

}

