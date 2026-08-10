import { Skeleton } from '@/components/ui/skeleton'

export default function LoadingLocationConsultation() {
  return (
    <main className="container mx-auto min-h-screen space-y-6 p-6" aria-busy="true" aria-label="Cargando examen de ubicación">
      <Skeleton className="h-10 w-full max-w-lg" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-96 w-full" />
    </main>
  )
}
