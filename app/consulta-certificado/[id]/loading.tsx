import { Skeleton } from '@/components/ui/skeleton'

export default function LoadingCertificateDetail() {
  return (
    <main className="container mx-auto min-h-screen space-y-8 p-4" aria-busy="true" aria-label="Cargando certificado">
      <Skeleton className="mx-auto h-12 w-full max-w-3xl" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Skeleton className="h-[420px] w-full" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    </main>
  )
}
