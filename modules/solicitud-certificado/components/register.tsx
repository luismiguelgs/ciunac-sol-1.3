import { StepperControl } from '@/components/stepper'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { finalSchema, IFinalSchema, initialValues } from '@/schemas/final.schema'
import { Form } from '@/components/ui/form'
import SwithField from '@/components/forms/switch.field'
import MyAlert from '@/components/forms/myAlert'
import { toast } from "sonner"
import SolicitudesService from '@/services/solicitudes.service'
import Isolicitud from '@/interfaces/solicitud.interface'
import EmailService from '@/services/email.service'
import GeneralDialog from '@/components/dialogs/general-dialog'
import { Button } from '@/components/ui/button'
import { Loader2, ExternalLink } from "lucide-react"
import { useRouter } from 'next/navigation'
import DetalleSolicitudCard from '@/components/detalle-solicitud-card'
import useSolicitudStore from '@/stores/solicitud.store'
import useStore from '@/hooks/useStore'
import { useTextsStore } from '@/stores/types.stores'
import EstudiantesService from '@/services/estudiantes.service'
import IEstudiante from '@/interfaces/estudiante.interface'

type Props = {
    activeStep : number
    steps : string[]
    setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

export default function Register({activeStep, setActiveStep, steps}:Props) 
{
    const router = useRouter()
    const [loading, setLoading] = React.useState<boolean>(false)
    const [open, setOpen] = React.useState<boolean>(false)
    const [state, setState] = React.useState<'SAVE'|'EMAIL'|'ERROR'>('SAVE')
    const [message, setMessage] = React.useState<React.ReactNode>('')
   
    const { solicitud } = useSolicitudStore()
    const textos = useStore(useTextsStore, (state) => state.textos)

    const form = useForm<IFinalSchema>({
        resolver: zodResolver(finalSchema),
        defaultValues: initialValues,
    })

    const onSubmit = async (data: IFinalSchema) => {
        if(!data.info || !data.terminos){
            toast.error('Verificar Información',{
                description: 'Por favor, verifica que se confirma que todos los datos son correctos, y/o acepta los términos.'
            })
        }else{
            setLoading(true)
            setState('SAVE')
            setOpen(true)
            let resEstudiante: IEstudiante | null = null
            //guarda la informacion en la base de datos guardar o actualizar datos de estudiante
            if(solicitud.estudianteId){
                //objeto estudiante
                resEstudiante = await EstudiantesService.updateItem(solicitud.estudianteId, solicitud)
            }else{
                resEstudiante = await EstudiantesService.newItem(solicitud)
            }
            if(!resEstudiante){
                setState('ERROR')
                setMessage('Error al guardar estudiante')
                setOpen(true)
                return
            }
            //objeto solicitud
            const resSolicitud = await SolicitudesService.newItem({...solicitud, estudianteId: resEstudiante.id} as Isolicitud)
            if(!resSolicitud){
                setState('ERROR')
                setMessage('Error al guardar la solicitud')
                setOpen(true)
                return
            }else{
                setState('EMAIL')
                setMessage('Solicitud guardada correctamente')
                //envia un correo electronico confirmando la recepcion de la solicitud
                await EmailService.sendEmailCertificado(solicitud.email as string, resSolicitud as string )
                setOpen(false)
            }
            
            //redirecciona al usuario a la pagina final de la solicitud
            router.push(`/solicitud-certificados/finalizar?id=${resSolicitud}`)
        }
    }

    return (
        <div>
            <div className="grid grid-cols-1 gap-6">
                <MyAlert 
                    title='Verifica tus datos'
                    description={textos?.find(objeto=> objeto.codigo === 'TEXTO_1_FINAL')?.contenido}
                    type='warning'
                />
                <DetalleSolicitudCard solicitud={solicitud} tipo='CERTIFICADO' />
                    <MyAlert
                        title='Importante'
                        description={textos?.find(objeto=> objeto.codigo === 'TEXTO_1_DISCLAMER')?.contenido}
                        type='warning'
                    />
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
                    <SwithField 
                        name='info'
                        label="Confirmo que los datos son correctos"
                        control={form.control}
                        description='Los datos consignados estan correctos y los documentos adjuntos son los verídicos.'
                    />
                    <div className='mt-4'>
                        <SwithField 
                        name='terminos'
                        label="Acepto los términos y condiciones"
                        control={form.control}
                        description='Declaro que conozco el reglamento respecto a certificados CIUNAC' 
                        />
                    </div>
                    <div className="flex justify-end items-center mt-2">
                        <Link href='https://ciunac.unac.edu.pe/reglamento/' target="_blank" rel="noopener noreferrer" className="text-blue-500 underline flex items-center">
                            Ver Reglamento <ExternalLink className="ml-1 w-4 h-4" />
                        </Link>
                    </div>
                    
                    <StepperControl 
                        activeStep={activeStep} 
                        steps={steps} 
                        setActiveStep={setActiveStep}
                        type="submit"
                        disabled={loading}
                    />
                </form>
            </Form>
            <GeneralDialog 
				open={open} 
				setOpen={setOpen}
				title="Espere, procesando información..." 
				description={state === 'EMAIL'? "Enviando correo electrónico" : state === 'SAVE'? "Guardando información" : "Error al procesar la solicitud"}
			>
				<div className="flex items-center justify-between gap-6 p-4">
					<Image 
						src={state === 'EMAIL' ? "/images/send-email.png" : state === 'SAVE' ? "/images/save-student.png" : "/images/error.png"}
						alt="Estado del proceso"
						width={120}
						height={120}
						className="flex-shrink-0"
					/>
					<div className="flex flex-col items-center space-y-4">
						{ state !== 'ERROR' ? (<>
							<Loader2 className="h-16 w-16 animate-spin text-primary" />
							<span className="text-sm text-muted-foreground">
								Espere por favor, estamos procesando su solicitud. Esto puede tomar unos minutos.
							</span>
						</>):(<>
							<span className="text-sm text-muted-foreground font-bold">
								{message}
							</span>
							<Button
								className="mt-4"
								type="button"
								color="primary"
								onClick={()=>setOpen(false)}
							>
								Cerrar
							</Button>
						</>)}
					</div>
				</div>
			</GeneralDialog>
        </div>
    )
}
