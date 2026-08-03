import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User } from "lucide-react"
import Copyright from "@/modules/shared/components/copyright"
import UbicacionDetalle from "@/modules/consulta-ubicacion/components/ubicacion-detalle"
import { GraduationCap } from "lucide-react"
import { redirect } from 'next/navigation'
import { ISolicitudRes } from '@/modules/shared/interfaces/solicitud.interface'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { readConsultationSession } from '@/modules/security/server/session'

interface PageProps {
    params: Promise<{ 
        dni: string 
    }>
}

function normalizeText(value: string) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
}

export default async function UbicationDetailPage({ params }: PageProps)
{
    const { dni } = await params
    const consultation = await readConsultationSession('EXAMEN', dni)
    if (!consultation) redirect('/consulta-ubicacion')

    const solicitudes = await ciunacRequest<ISolicitudRes[]>(`solicitudes/documento/${dni}`)
    const solicitud = solicitudes.find((item) =>
        normalizeText(item.tiposSolicitud?.solicitud ?? '').includes('UBICACION')
    )
    if (!solicitud) redirect('/consulta-ubicacion')

    const nombres = solicitud.estudiante?.nombres ?? ''
    const apellidos = solicitud.estudiante?.apellidos ?? ''
    const solicitudId = solicitud.id

    return (
        <main className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-primary">
                Detalle de Ubicación y Notas
            </h1>

            {/* Student Information */}
            <Card className="shadow-lg">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-semibold">
                            Datos del Alumno
                        </h2>
                    </div>
                    <Separator className="mb-4" />
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="space-y-1 p-3">
                            <p className="text-sm md:text-base">
                                <span className="font-semibold">Nombre del Alumno: </span>
                                {`${nombres.toLocaleUpperCase().trim()} ${apellidos.toLocaleUpperCase().trim()}`}
                            </p>
                            <p className="text-sm md:text-base">
                                <span className="font-semibold">DNI: </span>
                                {dni}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Grades List */}
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-semibold">
                            Notas del Alumno
                        </h2>
                    </div>
                    <Separator className="my-2" />
                </CardHeader>
                <CardContent>
                    <UbicacionDetalle dni={dni} solicitudId={solicitudId} />
                </CardContent>
            </Card>

            <div className="mt-auto">
                <Copyright />
            </div>
        </main>
    )
}
