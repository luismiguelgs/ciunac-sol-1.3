'use client'
import React from 'react'
import { IExamenUbicacion, IDetalleExamenUbicacion } from '../interfaces/examen.interface'
import SolicitudesExamenService from '../services/solicitud-examen.service'
import Download from './download'
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import useCiclos from '../hooks/useCiclos'

export default function UbicacionDetalle({dni}:{dni:string}) {

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
            <p className="text-center py-6 text-muted-foreground">
                No se encontraron notas para este alumno.
            </p>
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