import Image from 'next/image'
import { notFound } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import NotificationResult from '@/modules/shared/components/notification-result'
import { readNotificationReceipt } from '@/modules/security/server/session'
import {
  LocationCargoDownload,
  LocationFinalNotices,
} from '@/modules/solicitud-ubicacion'
import { getLocationTexts } from '@/modules/solicitud-ubicacion/server'

type PageProps = { searchParams: Promise<{ id?: string; receipt?: string }> }

export default async function FinalizarPage({ searchParams }: PageProps) {
  const { id, receipt: receiptId } = await searchParams
  if (!id || !/^[1-9]\d*$/.test(id)) notFound()
  const solicitudId = Number(id)
  if (!Number.isSafeInteger(solicitudId)) notFound()
  const [receipt, texts] = await Promise.all([
    readNotificationReceipt(receiptId, 'UBICACION', id),
    getLocationTexts().catch(() => []),
  ])
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
          <LocationCargoDownload solicitudId={solicitudId} texts={texts} />
          <LocationFinalNotices texts={texts} />
        </div>
      </div>
    </div>
  )
}
