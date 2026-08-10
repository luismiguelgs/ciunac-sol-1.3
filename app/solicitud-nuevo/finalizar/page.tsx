import React from 'react'
import Image from 'next/image'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import MyAlert from '@/components/forms/myAlert'
import NotificationResult from '@/modules/shared/components/notification-result'
import { readNotificationReceipt } from '@/modules/security/server/session'

type PageProps = {
    searchParams: Promise<{ receipt?: string }>
}

export default async function FinishPage({ searchParams }: PageProps) {
  const { receipt: receiptId } = await searchParams
  const receipt = await readNotificationReceipt(receiptId, 'REGISTER')
  const confirmed = Boolean(receipt)
  return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full flex flex-col items-center">
                {confirmed
                    ? <CheckCircle2 className="mb-2 h-16 w-16 text-green-500" />
                    : <AlertCircle className="mb-2 h-16 w-16 text-amber-500" />}
                <h1 className="mb-5 text-center text-4xl font-extrabold text-primary">
                    {confirmed ? '¡Proceso Finalizado!' : 'Estado no confirmado'}
                </h1>
                <div className="w-full flex flex-col md:flex-row items-center justify-center gap-16 mb-6">
                    {confirmed ? (
                        <div className="flex flex-col items-center">
                            <Image src="/images/save-student.png" alt="Estudiante guardado" width={100} height={100} className="rounded-lg shadow-md" />
                            <span className="mt-2 text-lg font-semibold text-green-700">Estudiante guardado exitosamente</span>
                        </div>
                    ) : null}
                    <NotificationResult confirmed={confirmed} />
                </div>
                <div className="w-full border-t border-gray-200 my-4"></div>
                <div className="w-full flex flex-col gap-3">
                    {confirmed ? <MyAlert
                        title="Verificación de datos"
                        description={<span className="ml-2 text-left text-base text-blue-900" style={{ fontSize: '1.1rem' }}>El proceso realizado registra un alumno en la plataforma de CIUNAC; no constituye una matrícula. Para la prematrícula y matrícula, revise los manuales enviados a su correo. <span className="font-bold">¡MUCHAS GRACIAS!</span></span>}
                    /> : <MyAlert
                        title="No se pudo confirmar el registro"
                        type="warning"
                        description="Esta página no contiene un comprobante válido. No vuelva a enviar el formulario sin consultar primero con CIUNAC."
                    />}
                    <MyAlert
                        title="Accesos al sistema"
                        type='warning'
                        description={<>
                            <span className="text-base text-red-900 text-left ml-2" style={{ fontSize: '1.1rem' }}>
                        {confirmed ? 'Puede revisar su correo electrónico para obtener los accesos al sistema. ' : ''}
                        Para confirmar el estado o reportar un problema, contacte al administrador.{' '}
                        <a href="mailto:ciunac.alumnosnuevos@unac.edu.pe" className="underline text-red-800 font-semibold">
                            ciunac.alumnosnuevos@unac.edu.pe
                        </a>
                        </span>
                        </>}
                    />
                </div>
            </div>
        </div>
    )
}
