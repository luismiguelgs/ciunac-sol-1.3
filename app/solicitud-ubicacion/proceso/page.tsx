'use client'
import React from 'react'
import { Stepper } from "@/components/stepper";
import { useSearchParams } from 'next/navigation';
import BasicData from '@/modules/solicitud-ubicacion/components/basic-data';
import FinData from '@/components/fin-data/fin-data';
import Documentos from '@/components/documentos';
import Register from '@/modules/solicitud-ubicacion/components/register';
import useSolicitudStore from '@/stores/solicitud.store';
import SolicitudesService from '@/services/solicitudes.service';
import GeneralDialog from '@/components/dialogs/general-dialog';
import Image from 'next/image';

function SolicitudUbicacionProceso()
{
    const searchParams = useSearchParams()
    const email = searchParams.get('email')
    const alumno = searchParams.get('alumno_ciunac')

    const { setSolicitudField } = useSolicitudStore()
    const [activeStep, setActiveStep] = React.useState(0);
    const [precio, setPrecio] = React.useState('0')
    const [bloqueoRep, setBloqueoRep] = React.useState<boolean>(false); // Estado para manejar el bloqueo de repetición

    // Cálculo dinámico de pasos
    const baseSteps = ["Datos básicos", "Datos de Pago", "Finalizar"];
    const optionalSteps = [];
    if (alumno === 'true') optionalSteps.push("Documentos");
    const steps = [...baseSteps.slice(0, 2), ...optionalSteps, ...baseSteps.slice(2)];

     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const  handleNext = async(values:any) =>{
        switch(activeStep){
            case 0:
                setSolicitudField('email', email)
                setSolicitudField('alumno_ciunac', alumno==='true')
                setSolicitudField('tipo_solicitud', values.tipo_solicitud)
                setSolicitudField('nombres', values.nombres)
                setSolicitudField('apellidos', values.apellidos)
                setSolicitudField('idioma', values.idioma)
                setSolicitudField('nivel', values.nivel)
                setSolicitudField('img_dni', values.img_dni)
                setSolicitudField('tipo_documento', values.tipo_documento)
                setSolicitudField('dni', values.dni)
                setSolicitudField('celular', values.celular)
                setSolicitudField('estudianteId', values.estudianteId)

                //pendiente de arreglar en produccion no se asigna el precio
                //solicitudes vacio array[]
                //const precio = solicitudes?.filter((cer)=> cer.value === values.tipo_solicitud)[0].precio
                const precio = 30
                setPrecio(precio.toString())
                break;
            case 1:
                setSolicitudField('pago', values.pago)
                setSolicitudField('numero_voucher', values.numero_voucher)
                setSolicitudField('fecha_pago', (values.fecha_pago as Date).toISOString())
                setSolicitudField('img_voucher', values.img_voucher)
                break;
            case 2:
                if(alumno === 'true'){
                    setSolicitudField('img_cert_estudio', values.img_cert_estudio)
                }
                break;
        }
        if(activeStep < steps.length - 1){
            if(activeStep === 0){
                //TODO: implementar verificación de duplicidad
                //verificar si existe una solicitud con los mismos datos buscar con dni
                const duplicado = await verificarDuplicidad(values.dni, values.idioma)
               
                //si existe mostrar alerta
                if(duplicado){
                    setBloqueoRep(true)
                    return
                }
            }
            setActiveStep((prevActiveStep) => prevActiveStep + 1)
        }
    }

    return (
        <div className="flex items-center justify-center">
            <Stepper steps={steps} activeStep={activeStep}>
                {
                    steps.map((step, index) => {
                        switch (step) {
                            case "Datos básicos":
                                return <BasicData
                                    key={index}
                                    activeStep={activeStep}
                                    setActiveStep={setActiveStep}
                                    handleNext={handleNext}
                                    steps={steps}
                                />
                            case "Datos de Pago":
                                return <FinData
                                    key={index}
                                    activeStep={activeStep}
                                    setActiveStep={setActiveStep}
                                    steps={steps}
                                    handleNext={handleNext}
                                    precio={precio}
                                />
                            case "Documentos":
                                return <Documentos 
                                            key={index}
                                            activeStep={activeStep}
                                            setActiveStep={setActiveStep}
                                            steps={steps}
                                            handleNext={handleNext}
                                        />
                            case "Finalizar":
                                return <Register 
                                            key={index}
                                            activeStep={activeStep}
                                            setActiveStep={setActiveStep}
                                            steps={steps}
                                        />
                            default:
                                return null;
                        }
                    })
                }
            </Stepper>
            <GeneralDialog open={bloqueoRep} setOpen={setBloqueoRep} title="Solicitud en proceso" >
                <BlockDialog />
            </GeneralDialog>
        </div>
    )
}

export default function ProcesoUbicacionPage() 
{
    return (
        <React.Suspense fallback={<div>Cargando...</div>}>
            <SolicitudUbicacionProceso />
        </React.Suspense>
    )    
}

async function verificarDuplicidad(dni: string, idioma:string) {
    const solicitud = await SolicitudesService.searchItemByDni(dni)
    //filtrar si la solicitud es nueva y del mismo idioma
    const nueva = solicitud.filter((s) => s.estadoId === 1 && s.idiomaId === +idioma)
    //si es de otro idioma no mostrar alerta
    return nueva.length > 0
}

function BlockDialog(){
	return(
		<>
        <Image
          src={'/images/error.png'} // Imagen existente en public/images
          alt="Advertencia"
		  width={100}
		  height={100}
          style={{
            margin: '0 auto 20px',
            display: 'block'
          }}
        />
        <span>
          Ya hay una solicitud en proceso. Por favor, espera a que termine 
          la operación actual antes de realizar una nueva solicitud. Si tiene
		  alguna duda, comuníquese con nosotros a través del telfono: <strong>014291931</strong>
        </span>
      </>
	)
}