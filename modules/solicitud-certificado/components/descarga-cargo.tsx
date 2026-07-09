'use client'

import React from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { pdf } from '@react-pdf/renderer'
import { CloudDownloadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCatalogStore } from '@/hooks/useCatalogStore'
import { ITexto } from '@/modules/shared/interfaces/types.interface'
import CargoPdf from '@/modules/solicitud-certificado/components/cargo-pdf'
import SolicitudesService from '@/services/solicitudes.service'
import { useTextsStore } from '@/stores/types.stores'
import pdfImage from "@/assets/pdf.png"

function Finish() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const { data: textos } = useCatalogStore(useTextsStore)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = React.useState<any>({})

    React.useEffect(() => {
        const getData = async (_id: number) => {
            const result = await SolicitudesService.getItemId(_id)
            setData(result)
        }
        getData(Number(id))
    }, [id])

    const exportPDF = async () => {
        const cargoPdfElement = <CargoPdf textos={textos as ITexto[]} obj={data} />
        const blobPdf = await pdf(cargoPdfElement).toBlob()
        const blobUrl = URL.createObjectURL(blobPdf)

        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = blobUrl
        a.download = `${data.estudiante.numeroDocumento}-${data.idioma.nombre}-${data.nivel.nombre}.pdf`

        document.body.appendChild(a)
        a.click()

        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-10">
                <Image src={pdfImage.src} alt="pdf" width={50} height={50} onClick={exportPDF} className="cursor-pointer" />
                <Button onClick={exportPDF} autoFocus disabled={false}>
                    Descargar Cargo
                    <CloudDownloadIcon className="ml-2" />
                </Button>
            </div>
        </div>
    )
}

export default function DescargaCargo() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <Finish />
        </React.Suspense>
    )
}
