'use client'

import React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CheckCircle, Loader2, Pencil, ShieldCheck } from 'lucide-react'
import InputField from '@/components/forms/input.field'
import MyInputOpt from '@/components/forms/input.otp'
import { MyAlertDialog } from '@/components/dialogs/alert-dialog'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
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
    const [codeRequested, setCodeRequested] = React.useState(false)
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
        if (!codeRequested) {
            setDialog('Primero compruebe su correo y solicite el código de verificación.')
            return
        }

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
            setCodeRequested(true)
            form.setValue('code', '')
            setTimeLeft(60)
            window.requestAnimationFrame(() => form.setFocus('code'))
        } catch (error) {
            setDialog(error instanceof Error ? error.message : 'No se pudo enviar el código.')
        } finally {
            captchaRef.current?.reset()
            setRequesting(false)
        }
    }

    const changeEmail = () => {
        setCodeRequested(false)
        setTimeLeft(null)
        form.setValue('code', '')
        form.clearErrors('code')
        captchaRef.current?.reset()
        window.requestAnimationFrame(() => form.setFocus('email'))
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 p-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Comprueba tu correo</CardTitle>
                            <CardDescription>
                                Ingresa tu correo, confirma el CAPTCHA y solicita el código.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <InputField
                                control={form.control}
                                name="email"
                                type="email"
                                disabled={codeRequested || requesting || verifying}
                            />

                            {(!codeRequested || timeLeft === null) && (
                                <div className="flex flex-col gap-2">
                                    {codeRequested && (
                                        <p className="text-center text-sm text-muted-foreground">
                                            Confirma nuevamente el CAPTCHA para reenviar el código.
                                        </p>
                                    )}
                                    <div className="flex justify-center overflow-x-auto p-1">
                                        <ReCAPTCHA
                                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
                                            ref={captchaRef}
                                        />
                                    </div>
                                </div>
                            )}

                            {codeRequested && (
                                <p aria-live="polite" className="text-center text-sm font-medium text-primary">
                                    {formattedTime
                                        ? `Código enviado. Podrás solicitar otro en ${formattedTime}.`
                                        : 'El código fue enviado. Ya puedes solicitar uno nuevo si lo necesitas.'}
                                </p>
                            )}
                        </CardContent>
                        <CardFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
                            {codeRequested && (
                                <Button
                                    disabled={requesting || verifying}
                                    onClick={changeEmail}
                                    type="button"
                                    variant="ghost"
                                    className="w-full sm:w-auto"
                                >
                                    <Pencil data-icon="inline-start" />
                                    Cambiar correo
                                </Button>
                            )}
                            <Button
                                disabled={requesting || verifying || timeLeft !== null}
                                onClick={requestCode}
                                type="button"
                                className="w-full sm:w-auto"
                            >
                                {requesting ? (
                                    <Loader2 data-icon="inline-start" className="animate-spin" />
                                ) : (
                                    <CheckCircle data-icon="inline-start" />
                                )}
                                {requesting
                                    ? 'Enviando código...'
                                    : codeRequested
                                        ? formattedTime
                                            ? `Reenviar en ${formattedTime}`
                                            : 'Reenviar código'
                                        : 'Comprobar correo y enviar código'}
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>2. Verifica el código</CardTitle>
                            <CardDescription>
                                {codeRequested
                                    ? 'Ingresa el código de 6 dígitos recibido por correo.'
                                    : 'Este paso se habilitará después de comprobar tu correo.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MyInputOpt
                                name="code"
                                label="Código de verificación"
                                control={form.control}
                                disabled={!codeRequested || requesting || verifying}
                                description="Ingresa el código de verificación de 6 dígitos"
                            />
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button
                                disabled={!codeRequested || requesting || verifying}
                                type="submit"
                                className="w-full sm:w-auto"
                            >
                                {verifying ? (
                                    <Loader2 data-icon="inline-start" className="animate-spin" />
                                ) : (
                                    <ShieldCheck data-icon="inline-start" />
                                )}
                                {verifying ? 'Verificando...' : 'Verificar código y continuar'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </>
    )
}
