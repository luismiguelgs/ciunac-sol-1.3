'use client'
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { pdf } from '@react-pdf/renderer'
import { IDetalleExamenUbicacion } from '../interfaces/examen.interface'
import ConstanciaFormat from '../components/ConstanciaFormat'
import Image from "next/image"
import pdfImage from '@/assets/pdf.png'

type Props = {
    item: IDetalleExamenUbicacion
    fecha: string,
    ciclo: string
}

export default function Download({item, fecha, ciclo}: Props) {
    const descargarPDF = async() => {
        const cargoPdfElement = <ConstanciaFormat data={item} fecha={fecha} ciclo={ciclo}/>
        const blobPdf = await pdf(cargoPdfElement).toBlob()
        const blobUrl = URL.createObjectURL(blobPdf)
        
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = blobUrl
        a.download = `${item.estudiante?.numeroDocumento}-${item.idioma?.nombre}-${item.nivel?.nombre}.pdf`

        document.body.appendChild(a)
        a.click()

        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Image
                    src={pdfImage}
                    alt="PDF Icon"
                    width={40}
                    height={40}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={descargarPDF}
                />
                <Button 
                    variant="default"
                    className="flex-1"
                    onClick={descargarPDF}
                >
                    <FileDown className="mr-2 h-4 w-4" />
                    {`Descargar Constancia ${fecha}`}
                </Button>
            </div>
            <p className="text-sm text-destructive pl-2">
                Click para descargar su constancia
            </p>
        </div>
    )
}