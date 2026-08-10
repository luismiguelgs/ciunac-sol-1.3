import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6 text-primary">
      <div className="flex items-center gap-3 rounded-xl border bg-card px-6 py-5 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        <span>Preparando la solicitud de constancia...</span>
      </div>
    </main>
  )
}
