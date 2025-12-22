"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import React from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import { Form } from "@/components/ui/form"
import { StepperControl } from "@/components/stepper"
import SwithField from "@/components/forms/switch.field"
import GeneralDialog from "@/components/dialogs/general-dialog"
import IStudent from "../interfaces/student.interface"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import EmailService from "@/services/email.service"

const FormSchema = z.object({
    accept: z.boolean(),
    data: z.boolean(),
})

type Props = {
    activeStep: number
    setActiveStep: React.Dispatch<React.SetStateAction<number>>
    steps: string[] 
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveNewStudent: (student:IStudent) => Promise<any>
	student: IStudent
}

export function FinishForm({activeStep, setActiveStep, steps, student, saveNewStudent}:Props) 
{
	const router = useRouter()
    const [state, setState] = React.useState<'SAVE'|'EMAIL'|'ERROR'>('SAVE')
	const [message, setMessage] = React.useState<React.ReactNode>('')
    const [loading, setLoading] = React.useState<boolean>(true)
    const [open, setOpen] = React.useState<boolean>(false)
    
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			accept: false,
			data: false,
		},
	})

    // Add this effect to watch for changes in form values
    React.useEffect(() => {
        const subscription = form.watch((value) => {
            if (value.accept && value.data) {
                setLoading(false);
            }else{
				setLoading(true);
			}
        });
        return () => subscription.unsubscribe();
    }, [form]);

  	async function onSubmit() {	
		//console.log(data)
        setLoading(true)
        setState('SAVE')
        setOpen(true)

        const newStudent = await saveNewStudent(student)

		if(newStudent.status === 400) {
			setState('ERROR')
			setMessage(`${newStudent.body.message} DNI:${student.Numero_identificacion}. Comuníquese con el administrador
				 del sistema al correo: ciunac.alumnosnuevos@unac.edu.pe`)
			setLoading(false)
		}
		else{
			// Cambiar estado a EMAIL y mantener el diálogo abierto mientras se envía
			setState('EMAIL')
			// Dar un respiro al event loop para que React repinte el cambio de imagen
			await new Promise((r) => setTimeout(r, 0))
			await EmailService.sendEmailRegister(student)
			setLoading(false)
			setOpen(false)
			router.push('./solicitud-nuevo/finalizar')
		}
  	}

  	return (
    	<React.Fragment>
    		<Form {...form}>
      			<form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        			<div>
						<h3 className="mb-4 text-lg font-medium">Formulario de consentimiento</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<SwithField
								control={form.control}
								name="accept"
								label="Los datos proporcionados son los correctos"
								description="Marcar si los datos indicados lineas arriba son los correctos"
							/>
							<SwithField
								control={form.control}
								name="data"
								label="Acepta todos los términos y condiciones"
								description="Marcar si acepta todos los términos y condiciones líneas arriba"
							/>
          				</div>
        			</div>
					{/* Botones de navegación */}
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
		</React.Fragment>
  	)
}
