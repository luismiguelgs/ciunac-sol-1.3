'use client'

import React from 'react'
import SolicitudUbicacionProcess from '@/modules/solicitud-ubicacion/presentation/components/solicitud-ubicacion-process'

export default function ProcesoUbicacionPage() {
    return (
        <React.Suspense fallback={<div>Cargando...</div>}>
            <SolicitudUbicacionProcess />
        </React.Suspense>
    )
}
