import Image from 'next/image'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import NotificationResult from '@/modules/shared/components/notification-result'
import { readNotificationReceipt } from '@/modules/security/server/session'
import DescargaCargo from '@/modules/solicitud-constancia/presentation/components/descarga-cargo'
import FinalNotices from '@/modules/solicitud-constancia/presentation/components/final-notices'

type PageProps = {
  searchParams: Promise<{ id?: string; receipt?: string }>
}

export default async function FinalizarConstanciaPage({ searchParams }: PageProps) {
  const { id, receipt: receiptId } = await searchParams
  const solicitudId = Number(id)
  const validId = Number.isFinite(solicitudId) && solicitudId > 0 ? solicitudId : null
  if (!validId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="h-16 w-16 text-amber-500" />
        <h1 className="text-2xl font-bold">No se pudo identificar la solicitud</h1>
        <p className="max-w-lg text-muted-foreground">Regrese al flujo de constancias y verifique el estado antes de intentar nuevamente.</p>
      </div>
    )
  }

  const receipt = await readNotificationReceipt(receiptId, 'CONSTANCIA', String(validId))

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="flex w-full max-w-4xl flex-col items-center rounded-2xl bg-white p-4 shadow-2xl md:w-3/4">
        <CheckCircle2 className="mb-2 h-16 w-16 text-green-500" />
        <h1 className="mb-5 text-center text-4xl font-extrabold text-primary">Proceso finalizado</h1>
        <div className="mb-2 flex w-full flex-col items-center justify-center gap-16 md:flex-row">
          <div className="flex flex-col items-center">
            <Image src="/images/save-student.png" alt="Solicitud guardada" width={80} height={80} className="rounded-lg shadow-md" />
            <span className="mt-2 text-lg font-semibold text-green-700">Solicitud guardada exitosamente</span>
          </div>
          <NotificationResult confirmed={Boolean(receipt)} />
        </div>
        <div className="my-2 w-full border-t border-gray-200" />
        <div className="flex w-full flex-col gap-3">
          <DescargaCargo solicitudId={validId} />
          <FinalNotices />
        </div>
      </div>
    </div>
  )
}
