import EmptyState from '@/modules/shared/components/empty-state'

export default function CertificateNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <EmptyState
        title="Certificado no disponible"
        description="No se encontraron datos para el certificado consultado."
        href="/consulta-certificado"
        actionLabel="Volver"
      />
    </main>
  )
}
