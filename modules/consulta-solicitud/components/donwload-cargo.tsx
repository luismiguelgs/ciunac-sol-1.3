'use client'
import { Button } from "@/components/ui/button"
import Image from "next/image"
import pdfImage from '@/assets/pdf.png'
import { ISolicitudRes } from '@/interfaces/solicitud.interface'
import CargoPdf from '@/modules/consulta-solicitud/components/cargo-pdf'
import { pdf } from '@react-pdf/renderer'
import { ITexto } from '@/interfaces/types.interface'

type Props = {
    item: ISolicitudRes
    textos: ITexto[]
}

export default function DownloadCargo({item, textos}: Props) {
    const descargarPDF = async() => {
        const obj = {
            solicitud: item.tiposSolicitud?.solicitud || 'SOLICITUD DE CERTIFICADO',
            creado: new Date(item.creadoEn as string).toLocaleDateString(),
            apellidos: item.estudiante?.apellidos,
            nombres: item.estudiante?.nombres,
            dni: item.estudiante?.numeroDocumento,
            idioma: item.idioma?.nombre,
            nivel: item.nivel?.nombre,
            pago: item.pago,
            voucher: item.numeroVoucher
        }

        const cargoPdfElement = <CargoPdf textos={textos} obj={obj}/>
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
            <div className="flex items-center gap-1">
                <Image
                    src={pdfImage}
                    alt={String(item.id)}
                    width={50}
                    height={50}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={descargarPDF}
                />
                <Button 
                    variant="ghost" 
                    className="text-base"
                    onClick={descargarPDF}
                >
                    {`${item.estudiante?.numeroDocumento}-${item.idioma?.nombre}-${item.nivel?.nombre}.PDF`}
                </Button>
            </div>
            <p className="text-sm font-medium text-destructive pl-2">
                Puede descargar su cargo aqui!
            </p>
        </div>
    )
}