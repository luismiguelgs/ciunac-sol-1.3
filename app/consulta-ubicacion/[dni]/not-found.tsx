import EmptyState from '@/modules/shared/components/empty-state'

export default function LocationConsultationNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <EmptyState
        title="Solicitud de ubicación no disponible"
        description="No se encontró una solicitud de examen de ubicación para el documento consultado."
        href="/consulta-ubicacion"
        actionLabel="Realizar otra consulta"
      />
    </main>
  )
}
