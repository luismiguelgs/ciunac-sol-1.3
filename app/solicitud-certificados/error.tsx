'use client'

import RouteErrorState from '@/modules/shared/components/route-error-state'

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <RouteErrorState
      reset={reset}
      title="No se pudo abrir la solicitud de certificado"
      description="Los catalogos o el servicio no estan disponibles temporalmente. Intente nuevamente."
    />
  )
}
