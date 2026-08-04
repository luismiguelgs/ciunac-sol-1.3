'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  reset: () => void;
  title?: string;
  description?: string;
};

export default function RouteErrorState({
  reset,
  title = 'No se pudo cargar la informacion',
  description = 'El servicio no esta disponible temporalmente. Intente nuevamente.',
}: Props) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="flex max-w-lg flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-card p-8 text-center shadow-sm">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button type="button" onClick={reset}>Reintentar</Button>
      </div>
    </main>
  );
}
