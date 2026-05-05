import React from 'react';
import ISolicitudBeca from '@/modules/solicitud-beca/interfaces/solicitudbeca.interface';
import { normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { createRegisterSolicitudBecaUseCase } from '@/modules/solicitud-beca/application/factories/create-register-solicitud-beca-use-case';

type Params = {
  onSuccess: (requestId: string) => void;
};

export function useRegisterSolicitudBeca({ onSuccess }: Params) {
  const useCase = React.useMemo(() => createRegisterSolicitudBecaUseCase(), []);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState<'SAVE' | 'EMAIL' | 'ERROR'>('SAVE');
  const [message, setMessage] = React.useState<React.ReactNode>('');

  const submit = React.useCallback(
    async (solicitud: ISolicitudBeca) => {
      setLoading(true);
      setState('SAVE');
      setOpen(true);

      try {
        const result = await useCase.execute({ solicitud });
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
    [onSuccess, useCase]
  );

  return { loading, open, setOpen, state, message, submit };
}
