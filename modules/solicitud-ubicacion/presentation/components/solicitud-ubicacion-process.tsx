'use client'

import React from 'react';
import Image from 'next/image';
import { Stepper } from '@/components/stepper';
import BasicData from '@/modules/solicitud-ubicacion/components/basic-data';
import FinData, { PaymentOption } from '@/modules/shared/components/fin-data';
import Documentos from '@/modules/shared/components/documentos-step';
import Register from '@/modules/solicitud-ubicacion/components/register';
import useSolicitudStore from '@/stores/solicitud.store';
import GeneralDialog from '@/components/dialogs/general-dialog';
import { createCheckDuplicateSolicitudUbicacionUseCase } from '@/modules/solicitud-ubicacion/application/factories/create-check-duplicate-solicitud-ubicacion-use-case';
import { resolveSolicitudUbicacionPrice } from '@/modules/solicitud-ubicacion/domain/rules/resolve-solicitud-ubicacion-price';
import {
  SolicitudUbicacionStep,
  SolicitudUbicacionStepPayload,
} from '@/modules/solicitud-ubicacion/presentation/view-models/solicitud-ubicacion-process.view-model';

type BasicStepPayload = Extract<SolicitudUbicacionStepPayload, { tipo_solicitud: string }>;
type PaymentStepPayload = Extract<SolicitudUbicacionStepPayload, { pago: string }>;
type DocumentStepPayload = Extract<SolicitudUbicacionStepPayload, { img_cert_estudio: string }>;

function buildSteps(alumno: boolean): SolicitudUbicacionStep[] {
  return alumno
    ? ['Datos Básicos', 'Datos de Pago', 'Documentos', 'Finalizar']
    : ['Datos Básicos', 'Datos de Pago', 'Finalizar'];
}

function BlockDialog() {
  return (
    <>
      <Image
        src={'/images/error.png'}
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
        alguna duda, comuníquese con nosotros a través del teléfono: <strong>014291931</strong>
      </span>
    </>
  );
}

type Props = {
  email: string;
  alumno: boolean;
};

export default function SolicitudUbicacionProcess({ email, alumno }: Props) {
  const { solicitud, setSolicitudField, resetSolicitud } = useSolicitudStore();
  const [activeStep, setActiveStep] = React.useState(0);
  const [precio, setPrecio] = React.useState('0');
  const [bloqueoRep, setBloqueoRep] = React.useState(false);
  const duplicateUseCase = React.useMemo(() => createCheckDuplicateSolicitudUbicacionUseCase(), []);

  const steps = React.useMemo(() => buildSteps(alumno), [alumno]);
  const paymentOptions = React.useMemo<PaymentOption[]>(() => {
    const amount = Number(precio);
    return [{ value: String(precio), label: `S/${amount.toFixed(2)} - precio normal` }];
  }, [precio]);

  React.useEffect(() => {
    resetSolicitud();
    setActiveStep(0);
    setPrecio('0');
    setBloqueoRep(false);
  }, [alumno, email, resetSolicitud]);

  const handleNext = React.useCallback(
    async (values: SolicitudUbicacionStepPayload) => {
      switch (steps[activeStep]) {
        case 'Datos Básicos': {
          const basicValues = values as BasicStepPayload;
          setSolicitudField('email', email);
          setSolicitudField('alumno_ciunac', alumno);
          setSolicitudField('tipo_solicitud', basicValues.tipo_solicitud);
          setSolicitudField('nombres', basicValues.nombres);
          setSolicitudField('apellidos', basicValues.apellidos);
          setSolicitudField('idioma', basicValues.idioma);
          setSolicitudField('nivel', basicValues.nivel);
          setSolicitudField('img_dni', basicValues.img_dni);
          setSolicitudField('tipo_documento', basicValues.tipo_documento);
          setSolicitudField('dni', basicValues.dni);
          setSolicitudField('celular', basicValues.celular);
          setSolicitudField('estudianteId', basicValues.estudianteId);
          setPrecio(resolveSolicitudUbicacionPrice());

          const duplicado = await duplicateUseCase.execute({
            dni: basicValues.dni,
            idioma: basicValues.idioma,
            tipoSolicitud: basicValues.tipo_solicitud,
          });

          if (duplicado) {
            setBloqueoRep(true);
            return;
          }
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
          if (alumno) {
            setSolicitudField('img_cert_estudio', documentValues.img_cert_estudio);
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
    [activeStep, alumno, duplicateUseCase, email, setSolicitudField, steps]
  );

  return (
    <div className="flex items-center justify-center">
      <Stepper steps={steps} activeStep={activeStep}>
        {steps.map((step, index) => {
          switch (step) {
            case 'Datos Básicos':
              return (
                <BasicData
                  key={index}
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                  handleNext={handleNext}
                  steps={steps}
                  alumno={alumno}
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
                  documentNumber={solicitud.dni ?? ''}
                  defaultValues={{
                    pago: String(solicitud.pago ?? '0'),
                    numero_voucher: solicitud.numero_voucher ?? '',
                    fecha_pago: solicitud.fecha_pago ? new Date(solicitud.fecha_pago) : undefined,
                    img_voucher: solicitud.img_voucher ?? '',
                  }}
                  paymentOptions={paymentOptions}
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
      <GeneralDialog open={bloqueoRep} setOpen={setBloqueoRep} title="Solicitud en proceso" >
        <BlockDialog />
      </GeneralDialog>
    </div>
  );
}
