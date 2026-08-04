import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-primary">
      <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Preparando el cargo...
    </div>
  )
}
