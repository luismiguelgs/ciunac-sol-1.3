import { StepperControl } from '@/components/stepper'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { finalSchema, IFinalSchema, initialValues } from '@/modules/shared/schemas/final.schema'
import { Form } from '@/components/ui/form'
import SwithField from '@/components/forms/switch.field'
import MyAlert from '@/components/forms/myAlert'
import { toast } from 'sonner'
import Isolicitud from '@/modules/shared/interfaces/solicitud.interface'
import GeneralDialog from '@/components/dialogs/general-dialog'
import { Button } from '@/components/ui/button'
import { Loader2, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DetalleSolicitudCard from '@/modules/consulta-solicitud/components/detalle-solicitud-card'
import useSolicitudStore from '@/stores/solicitud.store'
import { useRegisterSolicitudUbicacion } from '@/modules/solicitud-ubicacion/presentation/hooks/use-register-solicitud-ubicacion'
import useTexts from '@/hooks/useTexts'

type Props = {
    activeStep: number
    steps: string[]
    setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

export default function Register({ activeStep, setActiveStep, steps }: Props) {
    const router = useRouter()
    const { solicitud } = useSolicitudStore()
    const textos = useTexts()
    const { loading, open, setOpen, state, message, submit } = useRegisterSolicitudUbicacion({
        onSuccess: (requestId) => {
            router.push(`/solicitud-ubicacion/finalizar?id=${requestId}`)
        },
    })

    const form = useForm<IFinalSchema>({
        resolver: zodResolver(finalSchema),
        defaultValues: initialValues,
    })
    const info = useWatch({ control: form.control, name: 'info' })
    const terminos = useWatch({ control: form.control, name: 'terminos' })
    const canSubmit = Boolean(info && terminos)

    const getText = (code: string, fallback: string) =>
        textos?.find((objeto) => objeto.codigo === code)?.contenido ?? fallback

    const onSubmit = async (data: IFinalSchema) => {
        if (!data.info || !data.terminos) {
            toast.error('Verificar Información', {
                description: 'Por favor, verifica que se confirma que todos los datos son correctos, y/o acepta los términos.',
            })
        } else {
            await submit(solicitud as Isolicitud)
        }
    }

    return (
        <div>
            <div className="grid grid-cols-1 gap-6">
                <MyAlert
                    title="Verifica tus datos"
                    description={getText(
                        'TEXTO_UBICACION_3',
                        'Verifique que los datos de la solicitud y los documentos adjuntos sean correctos antes de finalizar el registro.',
                    )}
                    type="warning"
                />
                <DetalleSolicitudCard solicitud={solicitud} tipo="EXAMEN" />
                <MyAlert
                    title="Importante"
                    description={getText(
                        'TEXTO_UBICACION_4',
                        'Una vez registrada la solicitud, se enviará una confirmación al correo indicado. Si detecta algún problema, comuníquese con CIUNAC.',
                    )}
                    type="warning"
                />
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
                    <SwithField
                        name="info"
                        label="Confirmo que los datos son correctos"
                        control={form.control}
                        description="Los datos consignados están correctos y los documentos adjuntos son los verídicos."
                    />
                    <div className="mt-4">
                        <SwithField
                            name="terminos"
                            label="Acepto los términos y condiciones"
                            control={form.control}
                            description="Declaro que conozco el reglamento respecto al examen de ubicación CIUNAC"
                        />
                    </div>
                    <div className="mt-2 flex items-center justify-end">
                        <Link
                            href="https://ciunac.unac.edu.pe/reglamento/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-500 underline"
                        >
                            Ver Reglamento <ExternalLink className="ml-1 h-4 w-4" />
                        </Link>
                    </div>

                    <StepperControl
                        activeStep={activeStep}
                        steps={steps}
                        setActiveStep={setActiveStep}
                        type="submit"
                        disabledPrevious={loading || canSubmit}
                        disabledNext={loading || !canSubmit}
                    />
                </form>
            </Form>
            <GeneralDialog
                open={open}
                setOpen={setOpen}
                title="Espere, procesando información..."
                description={state === 'EMAIL' ? 'Enviando correo electrónico' : state === 'SAVE' ? 'Guardando información' : 'Error al procesar la solicitud'}
            >
                <div className="flex items-center justify-between gap-6 p-4">
                    <Image
                        src={state === 'EMAIL' ? '/images/send-email.png' : state === 'SAVE' ? '/images/save-student.png' : '/images/error.png'}
                        alt="Estado del proceso"
                        width={120}
                        height={120}
                        className="flex-shrink-0"
                    />
                    <div className="flex flex-col items-center space-y-4">
                        {state !== 'ERROR' ? (
                            <>
                                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                                <span className="text-sm text-muted-foreground">
                                    Espere por favor, estamos procesando su solicitud. Esto puede tomar unos minutos.
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-sm font-bold text-muted-foreground">
                                    {message}
                                </span>
                                <Button
                                    className="mt-4"
                                    type="button"
                                    color="primary"
                                    onClick={() => setOpen(false)}
                                >
                                    Cerrar
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </GeneralDialog>
        </div>
    )
}
