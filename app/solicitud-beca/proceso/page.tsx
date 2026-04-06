'use client'
import { Stepper } from '@/components/stepper'
import BasicData from '@/modules/solicitud-beca/components/basic-data'
import { useSearchParams } from 'next/navigation' // 1. Importa useSearchParams
import React from 'react' // Asegúrate de importar React si usas JSX
import useSolicitudStore from '@/modules/solicitud-beca/stores/solicitud-beca.store'
import { IBasicInfoSchema } from '@/modules/solicitud-beca/schemas/basic-data.schema'
import Documents from '@/modules/solicitud-beca/components/documents'
import { DocumentsFormValues } from '@/modules/solicitud-beca/schemas/documents.schema'
import Register from '@/modules/solicitud-beca/components/register'
import useFacultades from '@/hooks/useFacultades'
import useEscuelas from '@/hooks/useEscuelas'

function BecaProcess() {
    const searchParams = useSearchParams() // 2. Llama al hook
    const email = searchParams.get('email') // 3. Obtén el valor del parámetro 'email'
    const facultades = useFacultades()
    const escuelas = useEscuelas()

    const [activeStep, setActiveStep] = React.useState(0);
    const { setSolicitudField } = useSolicitudStore()

    const steps = ["Solicitud de Beca", "Documentos Adjuntos", "Registro"];

    const handleNext = (values: IBasicInfoSchema | DocumentsFormValues) => {
        switch (activeStep) {
            case 0:
                if (isBasicInfoSchema(values)) {
                    const facultadName = facultades?.find(f => String(f.id) === values.facultad)?.nombre || ''
                    const escuelaName = escuelas?.find(e => String(e.id) === values.escuela)?.nombre || ''

                    setSolicitudField('email', email ?? '');
                    setSolicitudField('apellidos', values.apellidos);
                    setSolicitudField('nombres', values.nombres);
                    setSolicitudField('facultad', facultadName);
                    setSolicitudField('facultadId', values.facultad);
                    setSolicitudField('escuela', escuelaName);
                    setSolicitudField('escuelaId', values.escuela);
                    setSolicitudField('direccion', values.direccion);
                    setSolicitudField('codigo', values.codigo);
                    setSolicitudField('telefono', values.celular);
                    setSolicitudField('tipo_documento', values.tipo_documento);
                    setSolicitudField('numero_documento', values.dni);
                }
                break;
            case 1:
                if (isDocumentsFormValues(values)) {
                    setSolicitudField('constancia_matricula', values.constancia_matricula);
                    setSolicitudField('historial_academico', values.historial_academico);
                    setSolicitudField('contancia_tercio', values.constancia_tercio);
                    setSolicitudField('carta_de_compromiso', values.carta_compromiso);
                    setSolicitudField('declaracion_jurada', values.declaracion_jurada);
                }
                break;
        }
        if (activeStep < steps.length - 1) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1)
        }
    };

    return (
        <div className="flex items-center justify-center">
            <Stepper steps={steps} activeStep={activeStep}>
                {/* Contenido de cada paso */}
                <BasicData
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                    handleNext={handleNext}
                    steps={steps}
                />
                <Documents
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                    handleNext={handleNext}
                    steps={steps}
                />
                <Register
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                    steps={steps}
                />
            </Stepper>
        </div>
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function isBasicInfoSchema(value: any): value is IBasicInfoSchema {
        return (
            typeof value === 'object' &&
            value !== null &&
            'apellidos' in value &&
            'nombres' in value &&
            'dni' in value
        )
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any  
    function isDocumentsFormValues(value: any): value is DocumentsFormValues {
        return (
            typeof value === 'object' &&
            value !== null &&
            'constancia_matricula' in value &&
            'historial_academico' in value &&
            'constancia_tercio' in value
        )
    }
}
export default function BecaProcessPage() {
    return (<React.Suspense fallback={<div>Cargando...</div>}>
        <BecaProcess />
    </React.Suspense>)
}