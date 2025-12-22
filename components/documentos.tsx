import useStore from '@/hooks/useStore'
import { useTextsStore } from '@/stores/types.stores'
import React from 'react'
import useSolicitudStore from '@/stores/solicitud.store'
import { StepperControl } from '@/components/stepper'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import MyAlert from '@/components/forms/myAlert'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { UploadCloudIcon } from 'lucide-react'
import UploadImage from '@/components/upload-image'


type Props = {
    activeStep: number
    steps: string[]
    setActiveStep: React.Dispatch<React.SetStateAction<number>>
    handleNext: (values: { img_cert_trabajo: string, img_cert_estudio: string }) => void
}

export default function Documentos({ activeStep, handleNext, steps, setActiveStep }: Props) {
    const textos = useStore(useTextsStore, (state) => state.textos);
    const { solicitud } = useSolicitudStore()

    const [validation, setValidation] = React.useState({
        cert_trabajador: false,
        cert_ciunac: false,
    })

    const form = useForm({
        defaultValues: {
            img_cert_trabajo: solicitud.img_cert_trabajo ?? '',
            img_cert_estudio: solicitud.img_cert_estudio ?? '',
        },
    })

    const onSubmit = (values: { img_cert_trabajo: string, img_cert_estudio: string }) => {
        if (values.img_cert_trabajo === '' && solicitud.trabajador) {
            setValidation({ ...validation, cert_trabajador: true })
            return
        }
        if (values.img_cert_estudio === '' && solicitud.alumno_ciunac) {
            setValidation({ ...validation, cert_ciunac: true })
            return
        }
        handleNext(values)
    }

    return (
        <React.Fragment>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
                    <div
                        className={`
                        grid grid-cols-1 
                        ${solicitud.trabajador && solicitud.alumno_ciunac ? 'md:grid-cols-3' : 'md:grid-cols-2'} 
                        gap-4
                    `}
                    >
                        {/* Primera columna: MyAlert y Alerts */}
                        <div className="space-y-2">
                            <MyAlert
                                title='Atención'
                                description={textos?.find((objeto) => objeto.codigo === 'TEXTO_UBICACION_1')?.contenido}
                            />
                            <MyAlert
                                title='Atención'
                                description={textos?.find((objeto) => objeto.codigo === 'TEXTO_UBICACION_2')?.contenido}
                            />
                            <Alert variant="default">
                                <UploadCloudIcon className="h-4 w-4" />
                                <AlertTitle>Subida de archivos</AlertTitle>
                                <AlertDescription>
                                    Luego de buscar el archivo se subirá al servidor para su revisión. Se acepta
                                    formatos *.jpg, *.png, *.pdf
                                </AlertDescription>
                            </Alert>

                            {validation.cert_ciunac && (
                                <Alert variant="destructive">
                                    <UploadCloudIcon className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>
                                        Subir la imagen del certificado de estudios CIUNAC
                                    </AlertDescription>
                                </Alert>
                            )}

                            {validation.cert_trabajador && (
                                <Alert variant="destructive">
                                    <UploadCloudIcon className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>
                                        Subir la imagen del certificado de trabajador UNAC
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                        {/* Segunda y tercera columna: FileUploaderCards */}
                        {solicitud.trabajador && (
                            <div>
                                <UploadImage
                                    form={form}
                                    field="img_cert_trabajo"
                                    dni={solicitud.dni as string}
                                    folder='dnis'
                                    label="Certificado de Trabajador UNAC"
                                />
                            </div>
                        )}

                        {solicitud.alumno_ciunac && (
                            <div>
                                <UploadImage
                                    form={form}
                                    field="img_cert_estudio"
                                    dni={solicitud.dni as string}
                                    folder='becas'
                                    label="Certificado de Estudios CIUNAC"
                                />
                            </div>
                        )}
                    </div>

                    {/* Botones de navegación */}
                    <StepperControl
                        activeStep={activeStep}
                        steps={steps}
                        setActiveStep={setActiveStep}
                        type="submit"
                    />
                </form>
            </Form>
        </React.Fragment>
    )
}


