import React from 'react';
import Isolicitud from '@/modules/shared/interfaces/solicitud.interface';
import { normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { createRegisterSolicitudUbicacionUseCase } from '@/modules/solicitud-ubicacion/application/factories/create-register-solicitud-ubicacion-use-case';

type Params = {
  onSuccess: (requestId: string) => void;
};

export function useRegisterSolicitudUbicacion({ onSuccess }: Params) {
  const useCase = React.useMemo(() => createRegisterSolicitudUbicacionUseCase(), []);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState<'SAVE' | 'EMAIL' | 'ERROR'>('SAVE');
  const [message, setMessage] = React.useState<React.ReactNode>('');

  const submit = React.useCallback(
    async (solicitud: Isolicitud) => {
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
