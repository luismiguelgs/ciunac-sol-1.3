import React from 'react';
import ISolicitudBeca from '@/modules/solicitud-beca/interfaces/solicitudbeca.interface';
import { normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { createRegisterSolicitudBecaUseCase } from '@/modules/solicitud-beca/application/factories/create-register-solicitud-beca-use-case';

type Params = {
  onSuccess: (requestId: string, receiptId: string) => void;
};

export function useRegisterSolicitudBeca({ onSuccess }: Params) {
  const useCase = React.useMemo(() => createRegisterSolicitudBecaUseCase(), []);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState<'SAVE' | 'EMAIL' | 'EMAIL_ERROR' | 'ERROR'>('SAVE');
  const [message, setMessage] = React.useState<React.ReactNode>('');
  const [savedRequest, setSavedRequest] = React.useState<{ requestId: string; email: string } | null>(null);

  const retryEmail = React.useCallback(async () => {
    if (!savedRequest) return;
    setLoading(true);
    setState('EMAIL');
    setOpen(true);
    try {
      const receiptId = await useCase.retryNotification(savedRequest.email, savedRequest.requestId);
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
  }, [onSuccess, savedRequest, useCase]);

  const submit = React.useCallback(
    async (solicitud: ISolicitudBeca) => {
      if (savedRequest) return;
      setLoading(true);
      setState('SAVE');
      setOpen(true);

      try {
        const result = await useCase.execute({ solicitud });
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
    [onSuccess, savedRequest, useCase]
  );

  return { loading, open, setOpen, state, message, savedRequestId: savedRequest?.requestId, retryEmail, submit };
}
