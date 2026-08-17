'use client'

import React from 'react'
import Image from 'next/image'
import { AlertCircle, Download, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import GeneralDialog from '@/components/dialogs/general-dialog'
import MyAlert from '@/components/forms/myAlert'
import pdfImage from '@/assets/pdf.png'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import type {
  AcceptDigitalDocumentCommand,
  DigitalDocumentKind,
  DigitalDocumentResult,
  GetDigitalDocumentQuery,
} from '@/modules/consulta-solicitud/application/ports/digital-document.port'

type LoadState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'data'; document: DigitalDocumentResult }
  | { status: 'error'; message: string }

type AcceptanceState =
  | { status: 'idle' }
  | { status: 'accepting' }
  | { status: 'error'; message: string }

type Props = {
  solicitudId: number
  tipoDocumento: DigitalDocumentKind
  fallback: React.ReactNode
  getDocument: (query: GetDigitalDocumentQuery) => Promise<DigitalDocumentResult | null>
  acceptDocument: (command: AcceptDigitalDocumentCommand) => Promise<void>
}

const DOCUMENT_LABELS = {
  certificate: {
    button: 'Descargar Certificado',
    title: 'Aceptacion de Certificado',
    noun: 'certificado digital',
    available: 'Puede descargar su certificado digital aqui.',
  },
  constancia: {
    button: 'Descargar Constancia',
    title: 'Aceptacion de Constancia',
    noun: 'constancia digital',
    available: 'Puede descargar su constancia digital aqui.',
  },
} as const

export default function DigitalDocumentDownload({
  solicitudId,
  tipoDocumento,
  fallback,
  getDocument,
  acceptDocument,
}: Props) {
  const labels = DOCUMENT_LABELS[tipoDocumento]
  const [loadState, setLoadState] = React.useState<LoadState>({ status: 'loading' })
  const [acceptanceState, setAcceptanceState] = React.useState<AcceptanceState>({ status: 'idle' })
  const [open, setOpen] = React.useState(false)
  const [acceptedTerms, setAcceptedTerms] = React.useState(false)
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoadState({ status: 'loading' })
      try {
        const document = await getDocument({ kind: tipoDocumento, requestId: solicitudId })
        if (!mounted) return
        setLoadState(document ? { status: 'data', document } : { status: 'empty' })
      } catch (cause) {
        if (mounted) {
          setLoadState({
            status: 'error',
            message: normalizeAppError(cause, 'No se pudo consultar el documento digital.').message,
          })
        }
      }
    }
    void load()
    return () => { mounted = false }
  }, [attempt, getDocument, solicitudId, tipoDocumento])

  const requestDownload = () => {
    if (loadState.status !== 'data') return
    if (!loadState.document.accepted) {
      setOpen(true)
      return
    }
    downloadDocument(loadState.document)
  }

  const acceptAndDownload = async () => {
    if (loadState.status !== 'data' || !acceptedTerms || acceptanceState.status === 'accepting') return
    setAcceptanceState({ status: 'accepting' })
    try {
      await acceptDocument({
        kind: loadState.document.kind,
        documentId: loadState.document.id,
      })
      const acceptedDocument = { ...loadState.document, accepted: true }
      setLoadState({ status: 'data', document: acceptedDocument })
      setAcceptanceState({ status: 'idle' })
      setOpen(false)
      downloadDocument(acceptedDocument)
    } catch (cause) {
      setAcceptanceState({
        status: 'error',
        message: normalizeAppError(cause, 'No se pudo confirmar la descarga.').message,
      })
    }
  }

  if (loadState.status === 'loading') {
    return <Button disabled className="w-full"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Buscando documento...</Button>
  }

  if (loadState.status === 'error') {
    return (
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No se pudo consultar el documento</AlertTitle>
          <AlertDescription>{loadState.message}</AlertDescription>
        </Alert>
        <Button type="button" variant="outline" onClick={() => setAttempt((value) => value + 1)}>
          Reintentar consulta
        </Button>
        {fallback}
      </div>
    )
  }

  if (loadState.status === 'empty') return <>{fallback}</>

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-1">
        <Image src={pdfImage} alt="Documento digital PDF" width={50} height={50} className="mr-3" />
        <Button variant="default" size="lg" className="flex-1 gap-2" onClick={requestDownload}>
          <Download className="h-4 w-4" />{labels.button}
        </Button>
      </div>
      <p className="pl-2 text-sm font-medium text-destructive">{labels.available}</p>
      <GeneralDialog
        open={open}
        setOpen={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) {
            setAcceptedTerms(false)
            setAcceptanceState({ status: 'idle' })
          }
        }}
        title={labels.title}
        description={`Acepte los terminos antes de descargar el ${labels.noun}.`}
      >
        <div className="space-y-4">
          <MyAlert
            type="warning"
            title="Terminos y Condiciones"
            description={`CIUNAC almacenara su ${labels.noun} por un plazo maximo de 3 anos. El usuario es responsable de conservar el archivo descargado.`}
          />
          {acceptanceState.status === 'error' ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No se pudo continuar</AlertTitle>
              <AlertDescription>{acceptanceState.message}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex items-start gap-2">
            <input
              id={`accept-terms-${tipoDocumento}-${solicitudId}`}
              type="checkbox"
              className="mt-1"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
            />
            <label htmlFor={`accept-terms-${tipoDocumento}-${solicitudId}`} className="text-sm text-muted-foreground">
              Declaro haber leido y aceptar los terminos para la emision y descarga del documento digital.
            </label>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={acceptAndDownload}
              disabled={!acceptedTerms || acceptanceState.status === 'accepting'}
            >
              {acceptanceState.status === 'accepting' ? 'Procesando...' : 'Aceptar y descargar'}
            </Button>
          </div>
        </div>
      </GeneralDialog>
    </div>
  )
}

function downloadDocument(document: DigitalDocumentResult) {
  const anchor = window.document.createElement('a')
  anchor.href = document.url
  anchor.download = buildFileName(document)
  anchor.rel = 'noopener noreferrer'
  anchor.click()
}

function buildFileName(document: DigitalDocumentResult): string {
  const values = [document.documentNumber, document.descriptor, document.level, document.issuedAt?.slice(0, 10)]
  const baseName = values.filter(Boolean).join('-').replace(/[^A-Za-z0-9._-]+/g, '-')
  return `${baseName || 'documento'}.pdf`
}
