'use client'
import React from "react"
import { ICertificado } from "@/interfaces/certificado.interface"
import CertificadosService from "@/services/certificados.service"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import pdfImage from '@/assets/pdf.png'
import { Download, AlertCircle } from "lucide-react"
import GeneralDialog from "@/components/dialogs/general-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import MyAlert from "@/components/forms/myAlert"


export default function DownloadCertificado({ solucitudId }: { solucitudId: number }) {
    const [certificado, setCertificado] = React.useState<ICertificado | null>(null)
    const [open, setOpen] = React.useState(false)
    const [accepted, setAccepted] = React.useState(false)
    const [loadingAccept, setLoadingAccept] = React.useState(false)

    React.useEffect(() => {
        if (!solucitudId) return
        CertificadosService.selectItemBySolicitud(solucitudId).then((certificado) => {
            setCertificado(certificado)
        })
    }, [solucitudId])

    // Descargar certificado virtual item.url?
    const descargar = () => {
        if (certificado?.aceptado === false) {
            setOpen(true)
        } else {
            descargarPdf()
        }
    }

    const handleAceptar = async () => {
        if (!certificado?._id) return
        try {
            setLoadingAccept(true)
            await CertificadosService.updateStatus(String(certificado?._id), true)
            descargarPdf()
            setOpen(false)
        } finally {
            setLoadingAccept(false)
        }
    }

    const descargarPdf = () => {
        if (!certificado?.url) return
        const a = document.createElement('a')
        a.href = certificado?.url
        a.download = `${certificado?.numeroDocumento}-${certificado?.idioma}-${certificado?.nivel}-${certificado?.fechaEmision}.PDF`
        a.click()
    }

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-1">
                <Image
                    src={pdfImage}
                    alt={solucitudId.toString()}
                    width={50}
                    height={50}
                    className="cursor-pointer hover:opacity-80 transition-opacity mr-3"
                    onClick={descargar}
                />
                <Button
                    variant="default"
                    size="lg"
                    className="flex-1 justify-center cursor-pointer hover:opacity-90 transition-opacity drop-shadow text-base font-semibold gap-2 shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={descargar}
                >
                    <Download className="h-4 w-4" />
                    Descargar Certificado
                </Button>
            </div>
            <p className="text-sm font-medium text-destructive pl-2">
                Puede descargar su certificado digital aqui!
            </p>
            <GeneralDialog
                open={open}
                setOpen={setOpen}
                title="Aceptación de Certificado"
                description="Por favor, acepte el certificado para poder descargarlo."
                // eslint-disable-next-line react/no-children-prop
                children={
                    <>
                        <div className="space-y-4">
                            <MyAlert
                                type="warning"
                                title="Términos y Condiciones"
                                description="En caso del certificado digital, CIUNAC lo almacenará por un plazo máximo de 3 años dicho documento, en caso contrario el estudiante se hará responsable del almacenamiento del documento digital. En caso de pérdida podrá solicitar un duplicado previo cumplimiento de los requisitos."
                            />
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Aviso</AlertTitle>
                                <AlertDescription>
                                    Para continuar, debe aceptar los términos y condiciones, haciendo clic en el checkbox.
                                </AlertDescription>
                            </Alert>
                            <div className="flex items-start gap-2">
                                <input
                                    id="accept-terms"
                                    type="checkbox"
                                    className="mt-1"
                                    checked={accepted}
                                    onChange={(e) => setAccepted(e.target.checked)}
                                />
                                <label htmlFor="accept-terms" className="text-sm text-muted-foreground">
                                    Declaro haber leído y aceptar los Términos y Condiciones para la emisión y descarga del certificado digital.
                                </label>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    onClick={handleAceptar}
                                    disabled={!accepted || loadingAccept}
                                >
                                    {loadingAccept ? 'Procesando...' : 'Aceptar y descargar'}
                                </Button>
                            </div>
                        </div>
                    </>
                }
            />
        </div>
    )
}