import Image from 'next/image'
import {  CheckCircle2 } from 'lucide-react'
import Disclamer from '@/modules/solicitud-certificado/components/disclamer'
import DescargaCargo from '@/modules/solicitud-certificado/components/descarga-cargo'

export default function FinalizarPage() 
{
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
            <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-4xl md:w-3/4 sm:w-full flex flex-col items-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-2 animate-bounce" />
                <h1 className="text-4xl font-extrabold mb-5 text-center text-primary">¡Proceso Finalizado!</h1>
                <div className="w-full flex flex-col md:flex-row items-center justify-center gap-16 mb-2">
                    <div className="flex flex-col items-center">
                        <Image src="/images/save-student.png" alt="ok" width={80} height={80} className="rounded-lg shadow-md" />
                        <span className="mt-2 text-lg font-semibold text-green-700">Solicitud guardada exitosamente!</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Image src="/images/send-email.png" alt="ok" width={80} height={80} className="rounded-lg shadow-md" />
                        <span className="mt-2 text-lg font-semibold text-blue-700">Correo enviado exitosamente!</span>
                    </div>
                </div>
                <div className="w-full border-t border-gray-200 my-2"></div>
                <div className="w-full flex flex-col gap-1">
                    <DescargaCargo />
                    <Disclamer />
                </div>
            </div>
        </div>
    )
}
