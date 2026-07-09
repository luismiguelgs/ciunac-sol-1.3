'use client'
import React from 'react'
import { IExamenUbicacion, IDetalleExamenUbicacion } from '@/modules/consulta-ubicacion/interfaces/examen.interface'
import SolicitudesExamenService from '../services/solicitud-examen.service'
import Download from './download'
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import useCiclos from '../hooks/useCiclos'
import DescargaCargo from '@/modules/solicitud-ubicacion/components/descarga-cargo'

type Props = {
    dni: string
    solicitudId?: number
}

export default function UbicacionDetalle({dni, solicitudId}:Props) {

    const {data:ciclos} = useCiclos()
    const [notas, setNotas] = React.useState<IDetalleExamenUbicacion[]>([])
    const [loading, setLoading] = React.useState(true)
    const [examenes, setExamenes] = React.useState<IExamenUbicacion[]>([])

    React.useEffect(() => {
        const fetchNotas = async () => {
            setLoading(true)
            try {
                const rNotas = await SolicitudesExamenService.fetchItemsDetail(dni)
                const rExamenes = await SolicitudesExamenService.fetchItems()
                setNotas(rNotas)
                setExamenes(rExamenes)
            } catch (error) {
                console.error('Error al obtener las notas:', error)
            }
            finally {
                setLoading(false)
            }
        }
        fetchNotas()
    }, [dni])

    if (loading) {
        return <Loading />
    }

    if (notas.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="space-y-2">
                    <p className="font-medium">
                        Aún no se ha encontrado notas para este alumno.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Mientras se registran las notas, puede descargar el cargo de su solicitud de examen de ubicación.
                    </p>
                </div>
                {solicitudId ? <DescargaCargo solicitudId={solicitudId} /> : null}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {notas.map((nota) => (
                <React.Fragment key={nota.id}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                        <div>
                            <h3 className="font-medium">{nota.idioma?.nombre}</h3>
                            <p className="text-sm text-muted-foreground">
                                Fecha: {fechaFormateada(examenes.find((examen) => examen.id === nota.examenId)?.fecha)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm">
                                Nota: <span className="font-bold">{nota.nota}/100</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm">
                                Ubicación: <span className="font-bold">{ciclos.find((ciclo) => ciclo.id === nota.calificacion?.cicloId)?.nombre}</span>
                            </p>
                        </div>
                        <div>
                            <Download 
                                item={nota} 
                                fecha={fechaFormateada(examenes.find((examen) => examen.id === nota.examenId)?.fecha)}
                                ciclo={ciclos.find((ciclo) => ciclo.id === nota.calificacion?.cicloId)?.nombre || ""}
                            />
                        </div>
                    </div>
                    <Separator />
                </React.Fragment>
            ))}
        </div>
    )
}

function fechaFormateada(fecha: string | number | Date | undefined) {
    if (!fecha) return ''
    const d = new Date(fecha)
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-PE', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

function Loading() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
                <React.Fragment key={index}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-3/5" />
                            <Skeleton className="h-4 w-2/5" />
                        </div>
                        <div>
                            <Skeleton className="h-6 w-1/2" />
                        </div>
                        <div>
                            <Skeleton className="h-6 w-1/2" />
                        </div>
                        <div>
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    <Separator />
                </React.Fragment>
            ))}
        </div>
    )
}

