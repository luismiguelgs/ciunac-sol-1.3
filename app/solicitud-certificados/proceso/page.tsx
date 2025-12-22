'use client'
import FinData from "@/components/fin-data/fin-data";
import { Stepper } from "@/components/stepper";
import BasicData from "@/modules/solicitud-certificado/components/basic-data";
import Documentos from "@/components/documentos";
import Register from "@/modules/solicitud-certificado/components/register";
import useSolicitudStore from "@/stores/solicitud.store";
import { useDocumentsStore } from "@/stores/types.stores";
import { useSearchParams } from "next/navigation";
import React from "react";

function SolicitudCertificadoProceso()
{
    const { setSolicitudField } = useSolicitudStore()
    const certificados  = useDocumentsStore((state) => state.documents)
    const searchParams = useSearchParams()
    const email = searchParams.get('email')
    const trabajador = searchParams.get('trabajador')
    const antiguo = searchParams.get('antiguo')

    const [activeStep, setActiveStep] = React.useState(0);
    const [precio, setPrecio] = React.useState('0')

    // Cálculo dinámico de pasos
    const baseSteps = ["Datos básicos", "Datos de Pago", "Finalizar"];
    const optionalSteps = [];
    if (trabajador === 'true') optionalSteps.push("Documentos");
    const steps = [...baseSteps.slice(0, 2), ...optionalSteps, ...baseSteps.slice(2)];

   
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleNext = (values:any) =>{
        switch (activeStep) {
            case 0:
                setSolicitudField('email', email)
                setSolicitudField('trabajador', trabajador==='true')
                setSolicitudField('antiguo', antiguo==='true')
                setSolicitudField('tipo_solicitud', values.tipo_solicitud)
                setSolicitudField('apellidos', values.apellidos)
                setSolicitudField('nombres', values.nombres)
                setSolicitudField('celular', values.celular)
                setSolicitudField('idioma', values.idioma)
                setSolicitudField('nivel', values.nivel)
                setSolicitudField('estudianteId', values.estudianteId)
                setSolicitudField('facultad', values.facultad)
                setSolicitudField('escuela', values.escuela)
                setSolicitudField('codigo', values.codigo)
                setSolicitudField('tipo_documento', values.tipo_documento)
                setSolicitudField('dni', values.dni)
                //asignar digital
                if(values.tipo_solicitud === '1' || values.tipo_solicitud === '3'){
                    setSolicitudField('digital', false)
                }else{
                    setSolicitudField('digital', true)
                }
                //asignar precio
                const precio = certificados?.filter((cer)=> cer.id === Number(values.tipo_solicitud))[0].precio
                setPrecio(precio.toString())
                break;
            case 1:
                setSolicitudField('pago', values.pago)
                setSolicitudField('numero_voucher', values.numero_voucher)
                setSolicitudField('fecha_pago', (values.fecha_pago as Date).toISOString())
                setSolicitudField('img_voucher', values.img_voucher)
                break;
            case 2:
                if(trabajador === 'true'){
                    setSolicitudField('img_cert_trabajo', values.img_cert_trabajo)
                }
                break;
        }
        if(activeStep < steps.length - 1){
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
        </div>
    )
}


export default function SolicitudCertificadosPage() 
{
    return (<React.Suspense fallback={<div>Cargando...</div>}>
        <SolicitudCertificadoProceso />
    </React.Suspense>)
}
