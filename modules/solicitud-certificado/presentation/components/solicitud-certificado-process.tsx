'use client'

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Stepper } from '@/components/stepper';
import Documentos from '@/modules/shared/components/documentos-step';
import FinData from '@/modules/shared/components/fin-data';
import { useDocumentsStore } from '@/stores/types.stores';
import useSolicitudStore from '@/stores/solicitud.store';
import BasicData from '@/modules/solicitud-certificado/components/basic-data';
import Register from '@/modules/solicitud-certificado/components/register';
import { isSolicitudCertificadoDigital } from '@/modules/solicitud-certificado/domain/rules/is-solicitud-certificado-digital';
import { resolveSolicitudCertificadoPrice } from '@/modules/solicitud-certificado/domain/rules/resolve-solicitud-certificado-price';
import {
  SolicitudCertificadoStep,
  SolicitudCertificadoStepPayload,
} from '@/modules/solicitud-certificado/presentation/view-models/solicitud-certificado-process.view-model';

type BasicStepPayload = Extract<SolicitudCertificadoStepPayload, { tipo_solicitud: string }>;
type PaymentStepPayload = Extract<SolicitudCertificadoStepPayload, { pago: string }>;
type DocumentStepPayload = Extract<SolicitudCertificadoStepPayload, { img_cert_trabajo: string }>;

function buildSteps(trabajador: boolean): SolicitudCertificadoStep[] {
  return trabajador
    ? ['Datos básicos', 'Datos de Pago', 'Documentos', 'Finalizar']
    : ['Datos básicos', 'Datos de Pago', 'Finalizar'];
}

export default function SolicitudCertificadoProcess() {
  const { setSolicitudField, resetSolicitud } = useSolicitudStore();
  const certificados = useDocumentsStore((state) => state.data);
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const trabajador = searchParams.get('trabajador') === 'true';
  const antiguo = searchParams.get('antiguo') === 'true';

  const [activeStep, setActiveStep] = React.useState(0);
  const [precio, setPrecio] = React.useState('0');

  const steps = React.useMemo(() => buildSteps(trabajador), [trabajador]);

  React.useEffect(() => {
    resetSolicitud();
    setActiveStep(0);
    setPrecio('0');
  }, [antiguo, email, resetSolicitud, trabajador]);

  const handleNext = React.useCallback(
    (values: SolicitudCertificadoStepPayload) => {
      switch (steps[activeStep]) {
        case 'Datos básicos': {
          const basicValues = values as BasicStepPayload;
          setSolicitudField('email', email);
          setSolicitudField('trabajador', trabajador);
          setSolicitudField('antiguo', antiguo);
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
          setSolicitudField('digital', isSolicitudCertificadoDigital(basicValues.tipo_solicitud));
          setPrecio(resolveSolicitudCertificadoPrice(basicValues.tipo_solicitud, certificados));
          break;
        }
        case 'Datos de Pago': {
          const paymentValues = values as PaymentStepPayload;
          setSolicitudField('pago', paymentValues.pago);
          setSolicitudField('numero_voucher', paymentValues.numero_voucher);
          setSolicitudField('fecha_pago', (paymentValues.fecha_pago as Date).toISOString());
          setSolicitudField('img_voucher', paymentValues.img_voucher);
          break;
        }
        case 'Documentos': {
          const documentValues = values as DocumentStepPayload;
          if (trabajador) {
            setSolicitudField('img_cert_trabajo', documentValues.img_cert_trabajo);
          }
          break;
        }
        default:
          break;
      }

      if (activeStep < steps.length - 1) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    },
    [activeStep, antiguo, certificados, email, setSolicitudField, steps, trabajador]
  );

  return (
    <div className="flex items-center justify-center">
      <Stepper steps={steps} activeStep={activeStep}>
        {steps.map((step, index) => {
          switch (step) {
            case 'Datos básicos':
              return (
                <BasicData
                  key={index}
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                  handleNext={handleNext}
                  steps={steps}
                />
              );
            case 'Datos de Pago':
              return (
                <FinData
                  key={index}
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                  steps={steps}
                  handleNext={handleNext}
                  precio={precio}
                />
              );
            case 'Documentos':
              return (
                <Documentos
                  key={index}
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                  steps={steps}
                  handleNext={handleNext}
                />
              );
            case 'Finalizar':
              return (
                <Register
                  key={index}
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                  steps={steps}
                />
              );
            default:
              return null;
          }
        })}
      </Stepper>
    </div>
  );
}
