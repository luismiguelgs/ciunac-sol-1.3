'use client';

import RouteErrorState from '@/modules/shared/components/route-error-state';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <RouteErrorState reset={reset} description="No se pudieron consultar las solicitudes. Intente nuevamente." />;
}
