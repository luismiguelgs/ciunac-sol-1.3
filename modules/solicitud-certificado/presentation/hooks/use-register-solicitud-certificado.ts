import React from 'react';
import Isolicitud from '@/modules/shared/interfaces/solicitud.interface';
import { normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { createRegisterSolicitudCertificadoUseCase } from '@/modules/solicitud-certificado/application/factories/create-register-solicitud-certificado-use-case';
import { RegisterSolicitudDialogState } from '@/modules/solicitud-certificado/domain/types/register-solicitud-dialog-state';

type UseRegisterSolicitudCertificadoParams = {
  onSuccess: (requestId: string, receiptId: string) => void;
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
  const [savedRequest, setSavedRequest] = React.useState<{ requestId: string; email: string } | null>(null);

  const retryEmail = React.useCallback(async () => {
    if (!savedRequest) return;

    setLoading(true);
    setState('EMAIL');
    setOpen(true);
    try {
      const receiptId = await registerSolicitudCertificado.retryNotification(
        savedRequest.email,
        savedRequest.requestId,
      );
      setOpen(false);
      onSuccess(savedRequest.requestId, receiptId);
    } catch (error) {
      const appError = normalizeAppError(error, 'No se pudo procesar el correo de confirmacion.');
      setState('EMAIL_ERROR');
      setMessage(`${appError.message} Su solicitud ${savedRequest.requestId} ya esta guardada.`);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, [onSuccess, registerSolicitudCertificado, savedRequest]);

  const submit = React.useCallback(
    async (solicitud: Isolicitud) => {
      if (savedRequest) return;
      setLoading(true);
      setState('SAVE');
      setOpen(true);

      try {
        const result = await registerSolicitudCertificado.execute({ solicitud });
        if (result.status === 'saved_notification_failed') {
          setSavedRequest({ requestId: result.requestId, email: solicitud.email });
          setState('EMAIL_ERROR');
          setMessage(`${result.error.message} Su solicitud ${result.requestId} ya esta guardada.`);
          setOpen(true);
          return;
        }

        setOpen(false);
        onSuccess(result.requestId, result.notificationReceiptId);
      } catch (error) {
        const appError = normalizeAppError(error, 'Error al procesar la solicitud');
        setState('ERROR');
        setMessage(appError.message);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, registerSolicitudCertificado, savedRequest]
  );

  return {
    loading,
    open,
    setOpen,
    state,
    message,
    savedRequestId: savedRequest?.requestId,
    retryEmail,
    submit,
  };
}
