'use client'

import React from 'react'
import Link from 'next/link'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpenCheck, ClipboardList, Download, FileText, Paperclip, UploadCloud } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { StepperControl } from '@/components/stepper'
import { FileUploaderCard } from '@/components/forms/upload.field'
import { ScholarshipDocuments } from '@/modules/solicitud-beca/domain/solicitud-beca'
import { validateScholarshipDocumentMetadata } from '@/modules/solicitud-beca/domain/scholarship-document-policy'
import { documentsSchema, DocumentsFormValues } from '@/modules/solicitud-beca/schemas/documents.schema'
import { toDocumentFormValues } from '@/modules/solicitud-beca/presentation/scholarship-form.mapper'

type Props = {
  activeStep: number
  steps: string[]
  documentNumber: string
  defaultDocuments: ScholarshipDocuments | null
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
  handleNext: (values: DocumentsFormValues) => void
}

const DOCUMENT_FIELDS = [
  { name: 'constancia_matricula', label: 'Constancia de Matrícula', icon: FileText },
  { name: 'historial_academico', label: 'Historial Académico', icon: BookOpenCheck },
  { name: 'constancia_tercio', label: 'Constancia de Tercio/Quinto Superior', icon: ClipboardList },
  { name: 'carta_compromiso', label: 'Carta de Compromiso', icon: Paperclip },
  { name: 'declaracion_jurada', label: 'Declaración Jurada', icon: UploadCloud },
] as const

export default function Documents({ activeStep, steps, documentNumber, defaultDocuments, setActiveStep, handleNext }: Props) {
  const form = useForm<DocumentsFormValues>({
    resolver: zodResolver(documentsSchema),
    defaultValues: toDocumentFormValues(defaultDocuments),
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleNext)}>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          <Alert>
            <AlertTitle className="text-lg font-semibold">Instrucciones para postular a la beca</AlertTitle>
            <AlertDescription className="mt-2 space-y-2 text-sm">
              <p>Asegúrate de subir los cinco documentos en formato PDF, con un máximo de 8 MB por archivo:</p>
              <ul className="ml-2 list-inside list-disc space-y-1">
                <li>Constancia de Matrícula</li>
                <li>Historial Académico</li>
                <li>Constancia de Tercio / Quinto superior</li>
                <li>Carta de Compromiso</li>
                <li>Declaración Jurada</li>
                <li>
                  <Link
                    href="https://ciunac.unac.edu.pe/wp-content/uploads/2025/04/SOLICITUD-PARA-BECA-DE-CIUNAC-V2.docx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 underline"
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Carta de Compromiso / Declaración Jurada
                  </Link>
                  <span>: descargar, llenar, firmar y colocar huella. Enviar cada documento por separado.</span>
                </li>
              </ul>
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            {DOCUMENT_FIELDS.map((document) => (
              <FileUploaderCard
                key={document.name}
                name={document.name}
                label={document.label}
                dni={documentNumber}
                folder="becas"
                icon={document.icon}
                accept=".pdf"
                validateFile={validateScholarshipDocumentMetadata}
              />
            ))}
          </div>
        </div>
        <StepperControl activeStep={activeStep} steps={steps} setActiveStep={setActiveStep} type="submit" />
      </form>
    </FormProvider>
  )
}
