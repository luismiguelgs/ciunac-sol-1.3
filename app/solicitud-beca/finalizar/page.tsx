import Image from 'next/image'
import {  CheckCircle2 } from 'lucide-react'
import MyAlert from '@/components/forms/myAlert'

export default function FinalPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full flex flex-col items-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-2 animate-bounce" />
            <h1 className="text-4xl font-extrabold mb-5 text-center text-primary">¡Proceso Finalizado!</h1>
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-16 mb-6">
                <div className="flex flex-col items-center">
                    <Image src="/images/save-student.png" alt="ok" width={100} height={100} className="rounded-lg shadow-md" />
                    <span className="mt-2 text-lg font-semibold text-green-700">Solicitud guardada exitosamente!</span>
                </div>
                <div className="flex flex-col items-center">
                    <Image src="/images/send-email.png" alt="ok" width={100} height={100} className="rounded-lg shadow-md" />
                    <span className="mt-2 text-lg font-semibold text-blue-700">Correo enviado exitosamente!</span>
                </div>
            </div>
            <div className="w-full border-t border-gray-200 my-4"></div>
            <div className="w-full flex flex-col gap-3">
                <MyAlert
                    title="Verificación de datos"
                    description={<>
                        <span className="text-base text-blue-900 text-left ml-2" style={{ fontSize: '1.1rem' }}>
                            El proceso realizado es para registrar solicitud de BECA de CIUNAC, no significa que su beca esta aprobada, se revisará sus documentos 
                            de acuerdo al cronograma. <span className="font-bold">¡MUCHAS GRACIAS!</span>
                        </span>
                    </>}
                />
            </div>
        </div>
    </div>
)
}
