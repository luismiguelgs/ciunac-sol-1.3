import React from 'react'
import SolicitudConstanciasProcess from '@/modules/solicitud-constancia/solicitud-constancias-process'

export default function SolicitudConstanciasProcesoPage() {
    return (
        <React.Suspense fallback={<div>Cargando...</div>}>
            <SolicitudConstanciasProcess />
        </React.Suspense>
    )
}