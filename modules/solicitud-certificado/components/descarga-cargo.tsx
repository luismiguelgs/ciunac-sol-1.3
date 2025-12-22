'use client'
import useStore from '@/hooks/useStore'
import { ITexto } from '@/interfaces/types.interface'
import CargoPdf from '@/modules/solicitud-certificado/components/cargo-pdf'
import SolicitudesService from '@/services/solicitudes.service'
import { useTextsStore } from '@/stores/types.stores'
import Image from 'next/image'
import pdfImage from "@/assets/pdf.png";
import { pdf } from '@react-pdf/renderer'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import { Button } from '@/components/ui/button'
import { CloudDownloadIcon } from 'lucide-react'

function Finish()
{
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const textos = useStore(useTextsStore, (state) => state.textos)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = React.useState<any>({})

    React.useEffect(() => {
        const getData = async (_id:number) => {
            const result = await SolicitudesService.getItemId(_id)
            setData(result)
        }
        getData(Number(id))
    }, [])

    const exportPDF = async() => {
        const cargoPdfElement = <CargoPdf textos={textos as ITexto[]} obj={data}/>
        const blobPdf = await pdf(cargoPdfElement).toBlob()

        const blobUrl = URL.createObjectURL(blobPdf);

        // Crear un enlace (hipervínculo) invisible
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = blobUrl
        a.download = `${data.estudiante.numeroDocumento}-${data.idioma.nombre}-${data.nivel.nombre}.pdf`

        // Agregar el enlace al documento y hacer clic para iniciar la descarga
        document.body.appendChild(a);
        a.click();

        // Limpiar el enlace después de la descarga
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-10">
            <Image src={pdfImage.src} alt="pdf" width={50} height={50} onClick={exportPDF} className="cursor-pointer" />
            <Button  onClick={exportPDF} autoFocus disabled={false}>
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
