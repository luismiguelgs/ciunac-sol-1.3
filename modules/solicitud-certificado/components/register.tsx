import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { StepperControl } from '@/components/stepper'
import { finalSchema, IFinalSchema, initialValues } from '@/modules/shared/schemas/final.schema'
import { Form } from '@/components/ui/form'
import SwithField from '@/components/forms/switch.field'
import MyAlert from '@/components/forms/myAlert'
import Isolicitud from '@/modules/shared/interfaces/solicitud.interface'
import GeneralDialog from '@/components/dialogs/general-dialog'
import { Button } from '@/components/ui/button'
import DetalleSolicitudCard from '@/modules/consulta-solicitud/components/detalle-solicitud-card'
import useSolicitudStore from '@/stores/solicitud.store'
import { useCatalogStore } from '@/hooks/useCatalogStore'
import { useTextsStore } from '@/stores/types.stores'
import { useRegisterSolicitudCertificado } from '@/modules/solicitud-certificado/presentation/hooks/use-register-solicitud-certificado'

type Props = {
    activeStep: number
    steps: string[]
    setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

export default function Register({ activeStep, setActiveStep, steps }: Props) {
    const router = useRouter()
    const { solicitud } = useSolicitudStore()
    const { data: textos } = useCatalogStore(useTextsStore)
    const { loading, open, setOpen, state, message, savedRequestId, retryEmail, submit } = useRegisterSolicitudCertificado({
        onSuccess: (requestId, receiptId) => {
            router.push(`/solicitud-certificados/finalizar?id=${requestId}&receipt=${receiptId}`)
        },
    })

    const form = useForm<IFinalSchema>({
        resolver: zodResolver(finalSchema),
        defaultValues: initialValues,
    })

    const onSubmit = async (data: IFinalSchema) => {
        if (!data.info || !data.terminos) {
            toast.error('Verificar información', {
                description: 'Por favor, verifica que se confirma que todos los datos son correctos y acepta los términos.',
            })
            return
        }

        await submit(solicitud as Isolicitud)
    }

    return (
        <div>
            <div className="grid grid-cols-1 gap-6">
                <MyAlert
                    title="Verifica tus datos"
                    description={textos?.find((objeto) => objeto.codigo === 'TEXTO_1_FINAL')?.contenido}
                    type="warning"
                />
                <DetalleSolicitudCard solicitud={solicitud} tipo="CERTIFICADO" />
                <MyAlert
                    title="Importante"
                    description={textos?.find((objeto) => objeto.codigo === 'TEXTO_1_DISCLAMER')?.contenido}
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
                            description="Declaro que conozco el reglamento respecto a certificados CIUNAC"
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
                        disabled={loading || Boolean(savedRequestId)}
                    />
                </form>
            </Form>
            <GeneralDialog
                open={open}
                setOpen={setOpen}
                title="Espere, procesando información..."
                description={state === 'EMAIL_ERROR' ? 'Solicitud guardada; correo pendiente' : state === 'EMAIL' ? 'Enviando correo electrónico' : state === 'SAVE' ? 'Guardando información' : 'Error al procesar la solicitud'}
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
                        {state === 'SAVE' || state === 'EMAIL' ? (
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
                                <div className="flex gap-2">
                                    {state === 'EMAIL_ERROR' ? (
                                        <Button type="button" onClick={retryEmail} disabled={loading}>
                                            Reintentar correo
                                        </Button>
                                    ) : null}
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                        Cerrar
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </GeneralDialog>
        </div>
    )
}
