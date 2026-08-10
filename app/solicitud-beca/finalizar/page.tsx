import Image from 'next/image'
import { notFound } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import MyAlert from '@/components/forms/myAlert'
import NotificationResult from '@/modules/shared/components/notification-result'
import { readNotificationReceipt } from '@/modules/security/server/session'

type PageProps = {
  searchParams: Promise<{ id?: string; receipt?: string }>
}

const VALID_REQUEST_ID = /^[A-Za-z0-9_-]{1,80}$/

export default async function FinalPage({ searchParams }: PageProps) {
  const { id, receipt: receiptId } = await searchParams
  const requestId = id?.trim()
  if (!requestId || !VALID_REQUEST_ID.test(requestId)) notFound()

  const receipt = await readNotificationReceipt(receiptId, 'BECA', requestId)
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="flex w-full max-w-2xl flex-col items-center rounded-2xl bg-white p-8 shadow-2xl">
        <CheckCircle2 className="mb-2 h-16 w-16 text-green-500" />
        <h1 className="mb-5 text-center text-4xl font-extrabold text-primary">¡Proceso Finalizado!</h1>
        <div className="mb-6 flex w-full flex-col items-center justify-center gap-16 md:flex-row">
          <div className="flex flex-col items-center">
            <Image src="/images/save-student.png" alt="Solicitud guardada" width={100} height={100} className="rounded-lg shadow-md" />
            <span className="mt-2 text-lg font-semibold text-green-700">Solicitud guardada exitosamente</span>
            <span className="text-sm text-muted-foreground">Código: {requestId}</span>
          </div>
          <NotificationResult confirmed={Boolean(receipt)} />
        </div>
        <div className="my-4 w-full border-t border-gray-200" />
        <MyAlert
          title="Verificación de datos"
          description={(
            <span className="ml-2 text-left text-base text-blue-900">
              Este proceso registra una solicitud de beca CIUNAC; no significa que la beca esté aprobada.
              Los documentos serán revisados de acuerdo con el cronograma. <strong>¡Muchas gracias!</strong>
            </span>
          )}
        />
      </div>
    </div>
  )
}
