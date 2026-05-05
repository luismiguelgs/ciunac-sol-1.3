'use client'

import React from "react";
import SolicitudCertificadoProcess from "@/modules/solicitud-certificado/presentation/components/solicitud-certificado-process";

export default function SolicitudCertificadosPage() 
{
    return (<React.Suspense fallback={<div>Cargando...</div>}>
        <SolicitudCertificadoProcess />
    </React.Suspense>)
}
