'use client'

import React from 'react';
import { Stepper } from '@/components/stepper';
import useSolicitudBecaStore from '@/modules/solicitud-beca/stores/solicitud-beca.store';
import useFacultades from '@/hooks/useFacultades';
import useEscuelas from '@/hooks/useEscuelas';
import BasicData from '@/modules/solicitud-beca/components/basic-data';
import Documents from '@/modules/solicitud-beca/components/documents';
import Register from '@/modules/solicitud-beca/components/register';
import { IBasicInfoSchema } from '@/modules/solicitud-beca/schemas/basic-data.schema';
import { DocumentsFormValues } from '@/modules/solicitud-beca/schemas/documents.schema';
import { SolicitudBecaStep, SolicitudBecaStepPayload } from '@/modules/solicitud-beca/presentation/view-models/solicitud-beca-process.view-model';

function isBasicInfoSchema(value: SolicitudBecaStepPayload): value is IBasicInfoSchema {
  return 'apellidos' in value && 'nombres' in value && 'dni' in value;
}

function isDocumentsFormValues(value: SolicitudBecaStepPayload): value is DocumentsFormValues {
  return 'constancia_matricula' in value && 'historial_academico' in value && 'carta_compromiso' in value;
}

export default function SolicitudBecaProcess({ email }: { email: string }) {
  const facultades = useFacultades();
  const escuelas = useEscuelas();
  const [activeStep, setActiveStep] = React.useState(0);
  const { setSolicitudField, resetSolicitud } = useSolicitudBecaStore();

  const steps = React.useMemo<SolicitudBecaStep[]>(
    () => ['Solicitud de Beca', 'Documentos Adjuntos', 'Registro'],
    []
  );

  React.useEffect(() => {
    resetSolicitud();
    setActiveStep(0);
  }, [email, resetSolicitud]);

  const handleNext = React.useCallback(
    (values: SolicitudBecaStepPayload) => {
      switch (steps[activeStep]) {
        case 'Solicitud de Beca':
          if (isBasicInfoSchema(values)) {
            const facultadName = facultades?.find((f) => String(f.id) === values.facultad)?.nombre || '';
            const escuelaName = escuelas?.find((e) => String(e.id) === values.escuela)?.nombre || '';

            setSolicitudField('email', email);
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
        case 'Documentos Adjuntos':
          if (isDocumentsFormValues(values)) {
            setSolicitudField('constancia_matricula', values.constancia_matricula);
            setSolicitudField('historial_academico', values.historial_academico);
            setSolicitudField('contancia_tercio', values.constancia_tercio);
            setSolicitudField('carta_de_compromiso', values.carta_compromiso);
            setSolicitudField('declaracion_jurada', values.declaracion_jurada);
          }
          break;
        default:
          break;
      }

      if (activeStep < steps.length - 1) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    },
    [activeStep, email, escuelas, facultades, setSolicitudField, steps]
  );

  return (
    <div className="flex items-center justify-center">
      <Stepper steps={steps} activeStep={activeStep}>
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
  );
}
