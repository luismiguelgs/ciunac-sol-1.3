'use client'

import React from 'react'
import Image from 'next/image'
import { Download, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import GeneralDialog from '@/components/dialogs/general-dialog'
import MyAlert from '@/components/forms/myAlert'
import pdfImage from '@/assets/pdf.png'
import CertificadosService from '@/services/certificados.service'
import ConstanciasService from '@/services/constancias.service'

type TipoDocumentoDigital = 'certificado' | 'constancia'

type DocumentoDigital = {
    _id?: string
    id?: string
    dni?: string
    numeroDocumento?: string
    idioma?: string
    nivel?: string
    tipo?: string
    url?: string
    aceptado?: boolean
    fechaEmision?: string
}

type Props = {
    solicitudId: number
    tipoDocumento: TipoDocumentoDigital
    fallback: React.ReactNode
}

const DOCUMENTO_LABELS = {
    certificado: {
        button: 'Descargar Certificado',
        title: 'Aceptacion de Certificado',
        noun: 'certificado digital',
        available: 'Puede descargar su certificado digital aqui!',
    },
    constancia: {
        button: 'Descargar Constancia',
        title: 'Aceptacion de Constancia',
        noun: 'constancia digital',
        available: 'Puede descargar su constancia digital aqui!',
    },
}

export default function DownloadDocumentoDigital({ solicitudId, tipoDocumento, fallback }: Props) {
    const labels = DOCUMENTO_LABELS[tipoDocumento]
    const [documento, setDocumento] = React.useState<DocumentoDigital | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [open, setOpen] = React.useState(false)
    const [accepted, setAccepted] = React.useState(false)
    const [loadingAccept, setLoadingAccept] = React.useState(false)

    React.useEffect(() => {
        let mounted = true

        const fetchDocumento = async () => {
            if (!solicitudId) {
                setLoading(false)
                return
            }

            setLoading(true)
            const result = tipoDocumento === 'constancia'
                ? await ConstanciasService.selectItemBySolicitud(solicitudId)
                : await CertificadosService.selectItemBySolicitud(solicitudId)

            if (mounted) {
                setDocumento(result)
                setLoading(false)
            }
        }

        void fetchDocumento()

        return () => {
            mounted = false
        }
    }, [solicitudId, tipoDocumento])

    const descargar = () => {
        if (!documento?.url) return

        if (documento.aceptado === false) {
            setOpen(true)
            return
        }

        descargarPdf(documento)
    }

    const handleAceptar = async () => {
        const documentoId = documento?._id || documento?.id
        if (!documentoId || !documento?.url) return

        try {
            setLoadingAccept(true)

            if (tipoDocumento === 'constancia') {
                await ConstanciasService.updateStatus(documentoId, true)
            } else {
                await CertificadosService.updateStatus(documentoId, true)
            }

            setDocumento((current) => current ? { ...current, aceptado: true } : current)
            descargarPdf(documento)
            setOpen(false)
        } finally {
            setLoadingAccept(false)
        }
    }

    const descargarPdf = (documentoDigital: DocumentoDigital) => {
        if (!documentoDigital.url) return

        const a = document.createElement('a')
        a.href = documentoDigital.url
        a.download = buildFileName(documentoDigital, tipoDocumento)
        a.click()
    }

    if (loading) {
        return (
            <Button disabled className="w-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando documento...
            </Button>
        )
    }

    if (!isDownloadUrl(documento?.url)) {
        return <>{fallback}</>
    }

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-1">
                <Image
                    src={pdfImage}
                    alt={String(solicitudId)}
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
                    {labels.button}
                </Button>
            </div>
            <p className="text-sm font-medium text-destructive pl-2">
                {labels.available}
            </p>
            <GeneralDialog
                open={open}
                setOpen={setOpen}
                title={labels.title}
                description={`Por favor, acepte la ${labels.noun} para poder descargarla.`}
            >
                <div className="space-y-4">
                    <MyAlert
                        type="warning"
                        title="Terminos y Condiciones"
                        description={`CIUNAC almacenara su ${labels.noun} por un plazo maximo de 3 anos; en caso contrario el estudiante se hara responsable del almacenamiento del documento digital.`}
                    />
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Aviso</AlertTitle>
                        <AlertDescription>
                            Para continuar, debe aceptar los terminos y condiciones, haciendo clic en el checkbox.
                        </AlertDescription>
                    </Alert>
                    <div className="flex items-start gap-2">
                        <input
                            id={`accept-terms-${tipoDocumento}-${solicitudId}`}
                            type="checkbox"
                            className="mt-1"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                        />
                        <label htmlFor={`accept-terms-${tipoDocumento}-${solicitudId}`} className="text-sm text-muted-foreground">
                            Declaro haber leido y aceptar los Terminos y Condiciones para la emision y descarga de la {labels.noun}.
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
            </GeneralDialog>
        </div>
    )
}

function buildFileName(documento: DocumentoDigital, tipoDocumento: TipoDocumentoDigital) {
    const documentoLabel = tipoDocumento === 'constancia' ? 'CONSTANCIA' : 'CERTIFICADO'
    const numeroDocumento = documento.numeroDocumento || documento.dni || 'documento'
    const idioma = documento.idioma || documento.tipo || documentoLabel
    const nivel = documento.nivel || ''
    const fecha = documento.fechaEmision || ''

    return `${numeroDocumento}-${idioma}-${nivel}-${fecha}.PDF`
}

function isDownloadUrl(url: string | undefined) {
    return Boolean(url && url.trim() && url.trim().toLowerCase() !== 'no-url')
}
