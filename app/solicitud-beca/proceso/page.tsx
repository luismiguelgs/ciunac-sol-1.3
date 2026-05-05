'use client'

import React from 'react'
import SolicitudBecaProcess from '@/modules/solicitud-beca/presentation/components/solicitud-beca-process'

export default function BecaProcessPage() {
    return (<React.Suspense fallback={<div>Cargando...</div>}>
        <SolicitudBecaProcess />
    </React.Suspense>)
}
