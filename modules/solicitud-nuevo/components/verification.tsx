import React from 'react'
import Image from 'next/image'
import ReCAPTCHA from 'react-google-recaptcha'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { StepperControl } from '@/components/stepper'
import MyAlert from '@/components/forms/myAlert'
import MyInputOpt from '@/components/forms/input.otp'
import InputField from '@/components/forms/input.field'
import { requestOtp, verifyOtp } from '@/modules/security/client/security-client'
import {
    initialValues,
    IVerificationSchema,
    verificationSchema,
} from '@/modules/solicitud-nuevo/schemas/verificacion.schema'

type Props = {
    activeStep: number
    steps: string[]
    setActiveStep: React.Dispatch<React.SetStateAction<number>>
    handleNext: (data: IVerificationSchema) => void
}

export default function Verification({ activeStep, steps, setActiveStep, handleNext }: Props) {
    const [requesting, setRequesting] = React.useState(false)
    const [verifying, setVerifying] = React.useState(false)
    const [timeLeft, setTimeLeft] = React.useState<number | null>(null)
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
            await verifyOtp(data.email, 'NUEVO', data.code)
            handleNext(data)
        } catch (error) {
            toast.warning('Advertencia', {
                description: error instanceof Error ? error.message : 'No se pudo verificar el código.',
            })
        } finally {
            setVerifying(false)
        }
    }

    const requestCode = async () => {
        const emailIsValid = await form.trigger('email')
        if (!emailIsValid) {
            toast.warning('Verificar email', {
                description: 'Por favor, ingrese una dirección de correo electrónico válida.',
            })
            return
        }

        const captchaToken = captchaRef.current?.getValue()
        if (!captchaToken) {
            toast.warning('Advertencia', { description: 'Por favor, confirme que no es un robot.' })
            return
        }

        setRequesting(true)
        try {
            await requestOtp(form.getValues('email'), 'NUEVO', captchaToken)
            setTimeLeft(60)
            form.setFocus('code')
        } catch (error) {
            toast.error('No se pudo enviar el código', {
                description: error instanceof Error ? error.message : 'Intente nuevamente más tarde.',
            })
        } finally {
            captchaRef.current?.reset()
            setRequesting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
                <h2 className="mb-6 text-center text-2xl font-bold uppercase">
                    Verificación de correo electrónico
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="flex flex-col items-center space-y-4">
                        <Image
                            src="/images/email-verification.png"
                            alt="Verificación de correo"
                            width={190}
                            height={190}
                        />
                        <MyAlert
                            title="Comprobar tu correo electrónico:"
                            description={(
                                <>
                                    Ingresa tu correo electrónico y selecciona <strong>COMPROBAR</strong>. Recibirás
                                    un código de seis dígitos que deberás ingresar para continuar. Revisa también
                                    tu bandeja de correo no deseado.
                                </>
                            )}
                        />
                    </div>

                    <div className="space-y-6 pt-3">
                        <InputField
                            control={form.control}
                            name="email"
                            type="email"
                            disabled={requesting || verifying}
                        />
                        <div className="flex flex-col items-center space-y-4">
                            <Button
                                disabled={requesting || verifying || timeLeft !== null}
                                onClick={requestCode}
                                type="button"
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

                        {timeLeft !== null && (
                            <p className="mt-4 text-center text-xl">
                                Puede solicitar otro código en: 00:{timeLeft.toString().padStart(2, '0')}
                            </p>
                        )}

                        <div className="flex justify-center p-6">
                            <ReCAPTCHA
                                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
                                ref={captchaRef}
                            />
                        </div>
                    </div>
                </div>
                <StepperControl
                    activeStep={activeStep}
                    steps={steps}
                    setActiveStep={setActiveStep}
                    type="submit"
                    disabledNext={requesting || verifying}
                />
            </form>
        </Form>
    )
}
