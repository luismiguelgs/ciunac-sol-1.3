'use client'
import { useCatalogStore } from '@/hooks/useCatalogStore'
import { ITexto } from '@/modules/shared/interfaces/types.interface'
import CargoPdf from '@/modules/solicitud-ubicacion/components/cargo-pdf'
import SolicitudesService from '@/services/solicitudes.service'
import { useTextsStore } from '@/stores/types.stores'
import Image from 'next/image'
import pdfImage from "@/assets/pdf.png";
import { pdf } from '@react-pdf/renderer'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import { Button } from '@/components/ui/button'
import { CloudDownloadIcon } from 'lucide-react'
import { ISolicitudRes } from '@/modules/shared/interfaces/solicitud.interface'

type Props = {
    solicitudId?: number
}

function Finish({ solicitudId }: Props)
{
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const resolvedId = solicitudId || (id ? Number(id) : undefined)
    const { data: textos } = useCatalogStore(useTextsStore)
    const [data, setData] = React.useState<ISolicitudRes | null>(null)

    React.useEffect(() => {
        const getData = async (_id:number) => {
            const result = await SolicitudesService.getItemId(_id)
            setData(result)
        }

        if (!resolvedId || Number.isNaN(resolvedId)) {
            setData(null)
            return
        }

        getData(resolvedId)
    }, [resolvedId])

    const exportPDF = async() => {
        if (!data) return

        const cargoPdfElement = <CargoPdf textos={textos as ITexto[]} obj={data}/>
        const blobPdf = await pdf(cargoPdfElement).toBlob()

        const blobUrl = URL.createObjectURL(blobPdf);

        // Crear un enlace (hipervínculo) invisible
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = blobUrl
        a.download = `${data.estudiante?.numeroDocumento}-${data.idioma?.nombre}-${data.nivel?.nombre}.pdf`

        // Agregar el enlace al documento y hacer clic para iniciar la descarga
        document.body.appendChild(a);
        a.click();

        // Limpiar el enlace después de la descarga
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    }

    if (!resolvedId || Number.isNaN(resolvedId)) {
        return null
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-10">
            <Image src={pdfImage.src} alt="pdf" width={50} height={50} onClick={exportPDF} className="cursor-pointer" />
            <Button  onClick={exportPDF} autoFocus disabled={!data}>
                Descargar Cargo
                <CloudDownloadIcon className="ml-2" />
            </Button>
            </div>
        </div>
    )
}

export default function DescargaCargo({ solicitudId }: Props) {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <Finish solicitudId={solicitudId} />
        </React.Suspense>
    )
}

