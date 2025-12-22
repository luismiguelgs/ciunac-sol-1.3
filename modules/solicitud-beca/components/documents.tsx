'use client'
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileUploaderCard } from "@/components/forms/upload.field";
import { documentsSchema, DocumentsFormValues } from "../schemas/documents.schema";
import { StepperControl } from "@/components/stepper";
import React from "react";
import { Download } from "lucide-react";
import Link from "next/link";
import useStore from "../stores/solicitud-beca.store";

import {
    FileText,
    UploadCloud,
    Paperclip,
    ClipboardList,
    BookOpenCheck,
  } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Props = {
    activeStep : number
    steps : string[]
    setActiveStep: React.Dispatch<React.SetStateAction<number>>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleNext: (values:any) => void
}

export default function Documents({activeStep, setActiveStep, steps, handleNext}:Props) 
{
    const {solicitud} = useStore();

    const form = useForm<DocumentsFormValues>({
        resolver: zodResolver(documentsSchema),
        defaultValues: {
            constancia_matricula: "",
            historial_academico: "",
            constancia_tercio: "",
            carta_compromiso: "",
            declaracion_jurada: "",
        },
      });
    
    const onSubmit = (data: DocumentsFormValues) => {
        handleNext(data);
    };
    
    return (
        <React.Fragment>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {/* Columna 1: Instrucciones */}
                        <div>
                        <Alert>
      <AlertTitle className="text-lg font-semibold">Instrucciones para postular a la beca</AlertTitle>
      <AlertDescription className="mt-2 space-y-2 text-sm">
        <p>Por favor asegúrate de subir los siguientes documentos en formato PDF:</p>
        <ul className="list-disc list-inside ml-2 space-y-1">
          <li>Constancia de Matrícula</li>
          <li>Historial Académico</li>
          <li>Constancia de Tercio / Quinto superior</li>
          <li>Carta de Compromiso</li>
          <li>Declaración Jurada</li>
          <li>
            <Link
              href="https://ciunac.unac.edu.pe/wp-content/uploads/2025/04/SOLICITUD-PARA-BECA-DE-CIUNAC-V2.docx"
              target="_blank"
              className="text-blue-600 underline inline-flex items-center"
            >
              <Download className="w-4 h-4 mr-1" />
              Carta de Compromiso / Declaración Jurada
            </Link>
            <span>: descargar, llenar, firmar y colocar huella. Recuerda enviarlos por separado</span>
          </li>
        </ul>
        <p className="pt-2 font-medium">
          Todos los documentos deben ser legibles y estar en formato PDF. 
        </p>
        <p className="pt-2 font-medium">
          Para terminar dar click en siguiente. 
        </p>
      </AlertDescription>
    </Alert>
                        </div>

                        {/* Columna 2: Uploaders */}
                        <div className="space-y-2">
                            <FileUploaderCard 
                                name="constancia_matricula" 
                                label="Constancia de Matrícula" 
                                dni={solicitud.numero_documento}
                                folder="becas"
                                icon={FileText}/>
                            <FileUploaderCard 
                                name="historial_academico" 
                                label="Historial Académico" 
                                dni={solicitud.numero_documento}
                                folder="becas"
                                icon={BookOpenCheck} />
                             <FileUploaderCard 
                                folder="becas"
                                name="constancia_tercio" 
                                dni={solicitud.numero_documento}
                                label="Constancia de Tercio/Quinto Superior" 
                                icon={ClipboardList}/>
                            <FileUploaderCard 
                                folder="becas"
                                name="carta_compromiso" 
                                dni={solicitud.numero_documento}
                                label="Carta de Compromiso" 
                                icon={Paperclip}/>
                            <FileUploaderCard 
                                folder="becas"
                                name="declaracion_jurada" 
                                dni={solicitud.numero_documento}
                                label="Declaración Jurada" 
                                icon={UploadCloud}/>  
                        </div>
                    </div>
                        {/* Botones de acción */}
                        <StepperControl 
                            activeStep={activeStep} 
                            steps={steps} 
                            setActiveStep={setActiveStep}
                            type="submit"
                        />
                </form>
            </FormProvider>
        </React.Fragment>
    )
}
