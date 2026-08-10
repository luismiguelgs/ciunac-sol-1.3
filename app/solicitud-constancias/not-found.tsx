import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="flex max-w-lg flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center shadow-sm">
        <FileQuestion className="h-14 w-14 text-amber-500" aria-hidden="true" />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Solicitud no identificada</h1>
          <p className="text-sm text-muted-foreground">
            El identificador del cargo no es valido. Inicie o revise nuevamente el flujo de constancias.
          </p>
        </div>
        <Button asChild>
          <Link href="/solicitud-constancias">Volver a constancias</Link>
        </Button>
      </div>
    </main>
  )
}
