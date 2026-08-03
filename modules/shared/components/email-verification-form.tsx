'use client'

import React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CheckCircle, Loader2, Send } from 'lucide-react'
import InputField from '@/components/forms/input.field'
import MyInputOpt from '@/components/forms/input.otp'
import { MyAlertDialog } from '@/components/dialogs/alert-dialog'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { OtpPurpose } from '@/modules/security/domain/security.types'
import { requestOtp, verifyOtp } from '@/modules/security/client/security-client'
import {
    initialValues,
    IVerificationSchema,
    verificationSchema,
} from '@/modules/shared/schemas/verification.schema'

type Props = {
    action: (data: IVerificationSchema) => void
    purpose: OtpPurpose
}

export default function FormEmail({ action, purpose }: Props) {
    const [requesting, setRequesting] = React.useState(false)
    const [verifying, setVerifying] = React.useState(false)
    const [timeLeft, setTimeLeft] = React.useState<number | null>(null)
    const [dialog, setDialog] = React.useState<string | null>(null)
    const captchaRef = React.useRef<ReCAPTCHA>(null)

    const form = useForm<IVerificationSchema>({
        resolver: zodResolver(verificationSchema),
        defaultValues: initialValues,
    })

    React.useEffect(() => {
        if (timeLeft === null) return
        if (timeLeft <= 0) {
            setTimeLeft(null)
            return
        }

        const timeoutId = window.setTimeout(() => setTimeLeft((value) => (value ?? 1) - 1), 1000)
        return () => window.clearTimeout(timeoutId)
    }, [timeLeft])

    const onSubmit = async (data: IVerificationSchema) => {
        setVerifying(true)
        try {
            await verifyOtp(data.email, purpose, data.code)
            action(data)
        } catch (error) {
            setDialog(error instanceof Error ? error.message : 'No se pudo verificar el código.')
        } finally {
            setVerifying(false)
        }
    }

    const requestCode = async () => {
        const emailIsValid = await form.trigger('email')
        if (!emailIsValid) {
            setDialog('Por favor, ingrese una dirección de correo electrónico válida.')
            return
        }

        const captchaToken = captchaRef.current?.getValue()
        if (!captchaToken) {
            setDialog('Por favor, confirme que no es un robot.')
            return
        }

        setRequesting(true)
        try {
            await requestOtp(form.getValues('email'), purpose, captchaToken)
            setTimeLeft(60)
            form.setFocus('code')
        } catch (error) {
            setDialog(error instanceof Error ? error.message : 'No se pudo enviar el código.')
        } finally {
            captchaRef.current?.reset()
            setRequesting(false)
        }
    }

    const formattedTime = timeLeft === null
        ? null
        : `00:${timeLeft.toString().padStart(2, '0')}`

    return (
        <>
            <MyAlertDialog
                open={dialog !== null}
                onOpenChange={(open) => !open && setDialog(null)}
                title="Advertencia"
                description={dialog ?? ''}
            />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-2">
                    <div className="space-y-2 pt-1">
                        <InputField
                            control={form.control}
                            name="email"
                            type="email"
                            disabled={requesting || verifying}
                        />
                        <div className="flex flex-col items-center space-y-2">
                            <Button
                                disabled={requesting || verifying || timeLeft !== null}
                                onClick={requestCode}
                                type="button"
                                variant="outline"
                                className="w-full md:w-auto"
                            >
                                {requesting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                )}
                                Comprobar
                            </Button>

                            <MyInputOpt
                                name="code"
                                label="Código de verificación"
                                control={form.control}
                                disabled={verifying}
                                description="Ingresa el código de verificación de 6 dígitos"
                            />
                        </div>

                        {formattedTime && (
                            <p className="mt-2 text-center text-xl">
                                Puede solicitar otro código en: {formattedTime}
                            </p>
                        )}

                        <div className="flex justify-center p-1">
                            <ReCAPTCHA
                                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
                                ref={captchaRef}
                            />
                        </div>

                        <div className="flex justify-center">
                            <Button
                                disabled={requesting || verifying}
                                type="submit"
                                className="w-full px-10 py-2 text-md md:w-auto"
                            >
                                {verifying ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="mr-2 h-5 w-5" />
                                )}
                                Enviar
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </>
    )
}
