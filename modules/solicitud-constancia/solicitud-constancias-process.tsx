'use client'

import { Stepper } from "@/components/stepper";
import useSolicitudStore from "@/stores/solicitud.store";
import React from "react"
import BasicData from "../solicitud-certificado/components/basic-data";
import { SolicitudCertificadoStepPayload } from "../solicitud-certificado/presentation/view-models/solicitud-certificado-process.view-model";
import { useSearchParams } from "next/navigation";
import FinData from "../shared/components/fin-data";
import { useDocumentsStore } from "@/stores/types.stores";
import { resolveSolicitudCertificadoPrice } from "../solicitud-certificado/domain/rules/resolve-solicitud-certificado-price";
import Register from "../solicitud-certificado/components/register";

type BasicStepPayload = Extract<SolicitudCertificadoStepPayload, { tipo_solicitud: string }>;
type PaymentStepPayload = Extract<SolicitudCertificadoStepPayload, { pago: string }>;


const STEPS = [
    'Datos Básicos',
    'Datos de Pago',
    'Finalizar'
];

export default function SolicitudConstanciasProcess() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const { setSolicitudField, resetSolicitud } = useSolicitudStore();
    const constancias = useDocumentsStore((state) => state.data);
    const [activeStep, setActiveStep] = React.useState(0);
    const [precio, setPrecio] = React.useState('0');

    React.useEffect(() => {
        resetSolicitud();
        setActiveStep(0);
        setPrecio('0');
    }, [email, resetSolicitud]);

    const handleNext = React.useCallback(
        (values: SolicitudCertificadoStepPayload) => {
            switch (STEPS[activeStep]) {
                case 'Datos Básicos':
                    const basicValues = values as BasicStepPayload;
                    setSolicitudField('email', email);
                    setSolicitudField('trabajador', false);
                    setSolicitudField('antiguo', false);
                    setSolicitudField('tipo_solicitud', basicValues.tipo_solicitud);
                    setSolicitudField('apellidos', basicValues.apellidos);
                    setSolicitudField('nombres', basicValues.nombres);
                    setSolicitudField('celular', basicValues.celular);
                    setSolicitudField('idioma', basicValues.idioma);
                    setSolicitudField('nivel', basicValues.nivel);
                    setSolicitudField('estudianteId', basicValues.estudianteId);
                    setSolicitudField('facultad', basicValues.facultad);
                    setSolicitudField('escuela', basicValues.escuela);
                    setSolicitudField('codigo', basicValues.codigo);
                    setSolicitudField('tipo_documento', basicValues.tipo_documento);
                    setSolicitudField('dni', basicValues.dni);
                    setSolicitudField('digital', true);
                    setPrecio(resolveSolicitudCertificadoPrice(basicValues.tipo_solicitud, constancias));
                    break;
                case 'Datos de Pago':
                    const paymentValues = values as PaymentStepPayload;
                    setSolicitudField('pago', paymentValues.pago);
                    setSolicitudField('numero_voucher', paymentValues.numero_voucher);
                    setSolicitudField('fecha_pago', (paymentValues.fecha_pago as Date).toISOString());
                    setSolicitudField('img_voucher', paymentValues.img_voucher);
                    break;
                default:
                    break;
            }

            if (activeStep < STEPS.length - 1) {
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
            }
        },
        [activeStep, constancias, setSolicitudField, email]
    )

    return (
        <div className="flex items-center justify-center">
            <Stepper steps={STEPS} activeStep={activeStep}>
                {
                    STEPS.map((step, index) => {
                        switch (step) {
                            case 'Datos Básicos':
                                return (
                                    <BasicData
                                        key={index}
                                        activeStep={activeStep}
                                        setActiveStep={setActiveStep}
                                        handleNext={handleNext}
                                        steps={STEPS}
                                        tipoSolicitud="constancia"
                                    />
                                );
                            case 'Datos de Pago':
                                return (
                                    <FinData
                                        key={index}
                                        activeStep={activeStep}
                                        setActiveStep={setActiveStep}
                                        steps={STEPS}
                                        handleNext={handleNext}
                                        precio={precio}
                                    />
                                );
                            case 'Finalizar':
                                return (
                                   <Register
                                        key={index}
                                        activeStep={activeStep}
                                        setActiveStep={setActiveStep}
                                        steps={STEPS}
                                    />
                                );
                            default:
                                return null;
                        }
                    })
                }
            </Stepper>
        </div>
    )
}
