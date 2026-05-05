import React from 'react';
import Isolicitud from '@/modules/shared/interfaces/solicitud.interface';
import { normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { createRegisterSolicitudCertificadoUseCase } from '@/modules/solicitud-certificado/application/factories/create-register-solicitud-certificado-use-case';
import { RegisterSolicitudDialogState } from '@/modules/solicitud-certificado/domain/types/register-solicitud-dialog-state';

type UseRegisterSolicitudCertificadoParams = {
  onSuccess: (requestId: string) => void;
};

export function useRegisterSolicitudCertificado({ onSuccess }: UseRegisterSolicitudCertificadoParams) {
  const registerSolicitudCertificado = React.useMemo(
    () => createRegisterSolicitudCertificadoUseCase(),
    []
  );
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState<RegisterSolicitudDialogState>('SAVE');
  const [message, setMessage] = React.useState<React.ReactNode>('');

  const submit = React.useCallback(
    async (solicitud: Isolicitud) => {
      setLoading(true);
      setState('SAVE');
      setOpen(true);

      try {
        const result = await registerSolicitudCertificado.execute({ solicitud });
        setState('EMAIL');
        setMessage(result.message);
        setOpen(false);
        onSuccess(result.requestId);
      } catch (error) {
        const appError = normalizeAppError(error, 'Error al procesar la solicitud');
        setState('ERROR');
        setMessage(appError.message);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, registerSolicitudCertificado]
  );

  return {
    loading,
    open,
    setOpen,
    state,
    message,
    submit,
  };
}
