'use client'

import IProgram from "@/modules/solicitud-nuevo/interfaces/programs.interface"
import useStore from "../stores/student.store"
import MyAlert from "@/components/forms/myAlert"
import { FinishForm } from "./finish-form"
import DataDetail from "./data-detail"
import Link from "next/link"
import React from "react"

type Props = {
    programs : IProgram[]
    activeStep: number
    setActiveStep: React.Dispatch<React.SetStateAction<number>>
    steps: string[] 
}

export default function Finish({ programs, activeStep, setActiveStep, steps}:Props) 
{ 
    const { student } = useStore()

    return (
        <div className="space-y-6">
            <MyAlert
                title="Verificación de datos"
                description={<>
                    Verifique bien los datos enviados, para evitar problemas, en el registro de datos.
                    Será enviado un correo de confirmación, de registro en el sistema, y con los accesos respectivos y manuales,
                    para los siguientes pasos a seguir.
                </>}
            />
            <MyAlert
                title="Verificación de datos"
                type="error"
                description={<>
                    Si encuentra algún problema, y la información no es correcta, no llega el correo (verficar en la carpeta de no deseados),
                    o no tiene acceso a la cuenta, o existe alguna omisión o cambio en la información por favor contacte al administrador:
                    <Link  href="mailto:ciunac.alumnosnuevos@unac.edu.pe">ciunac.alumnosnuevos@unac.edu.pe</Link>
                </>}
            />

            <DataDetail 
                student={student} 
                programs={programs} 
            />

            <FinishForm 
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                steps={steps}
                student={student}
            />
            
        </div>
    )

}

