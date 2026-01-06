import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User } from "lucide-react"
import Copyright from "@/components/copyright"
import UbicacionDetalle from "@/modules/consulta-ubicacion/components/ubicacion-detalle"
import { GraduationCap } from "lucide-react"

interface PageProps {
    params: Promise<{ 
        dni: string 
    }>
    searchParams: Promise<{
        nombres: string
        apellidos: string
    }>
}

export default async function UbicationDetailPage({ params, searchParams }: PageProps) 
{
    const { dni } = await params
    const { nombres, apellidos } = await searchParams

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
                    <UbicacionDetalle dni={dni} />
                </CardContent>
            </Card>

            <div className="mt-auto">
                <Copyright />
            </div>
        </main>
    )
}