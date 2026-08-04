import React from 'react';
import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error';
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository';
import { externalRecordArraySchema, parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response';

interface ICiclo {
  id: number;
  nombre: string;
}

const useCiclos = () => {
  const [data, setData] = React.useState<ICiclo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<AppError | null>(null);
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await resourceApiRepository.list<ICiclo>('ciclos');
        const parsed = parseExternalResponse(externalRecordArraySchema, response, 'La API devolvio ciclos no validos') as unknown as ICiclo[];
        if (mounted) setData(parsed);
      } catch (cause) {
        if (mounted) setError(normalizeAppError(cause, 'No se pudieron cargar los ciclos'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchData();
    return () => { mounted = false; };
  }, [attempt]);

  const retry = React.useCallback(() => setAttempt((value) => value + 1), []);
  return { data, loading, error, retry };
};

export default useCiclos;
