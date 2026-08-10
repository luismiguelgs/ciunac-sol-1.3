import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-100 p-4">
      <div className="grid w-full max-w-5xl gap-4 md:grid-cols-2" aria-label="Cargando solicitudes">
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-7 w-3/5" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </main>
  )
}
