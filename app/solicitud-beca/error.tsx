'use client'

import RouteErrorState from '@/modules/shared/components/route-error-state'

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <RouteErrorState
      reset={reset}
      title="No se pudo abrir la solicitud de beca"
      description="Los catálogos académicos o el servicio no están disponibles temporalmente. Intente nuevamente."
    />
  )
}
