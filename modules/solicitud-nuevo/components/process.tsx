"use client"
import {Stepper} from "@/components/stepper";
import React from 'react'
import IProgram from '../interfaces/programs.interface'
import Verification from './verification'
import useStore from '../stores/student.store'
import Iverfication from "../interfaces/verification.interface";
import BasicData from "./basic-data";
import { IBasicInfoSchema } from "../schemas/basic-info.schema";
import Finish from "./finish";

type Props = {
    programs: IProgram[]
}

export default function Process({programs}:Props) 
{
    const [activeStep, setActiveStep] = React.useState(0);
    const { setStudentField } = useStore()

    const handleNext = (data:IBasicInfoSchema | Iverfication) => {
        switch (activeStep) {
            case 0:
                const values = data as Iverfication
                setStudentField('Email', values.email)
                break; 
            case 1:
                const basicInfo = data as IBasicInfoSchema
                setStudentField('Primer_apellido', basicInfo.firstLastname);
                setStudentField('Segundo_apellido', basicInfo.secondLastname);
                setStudentField('Primer_nombre', basicInfo.firstName);
                setStudentField('Segundo_nombre', basicInfo.secondName);
                setStudentField('Genero',basicInfo.gender);
                setStudentField('Codigo_tipo_identificacion', basicInfo.document_type);
                setStudentField('Numero_identificacion', basicInfo.document);
                setStudentField('Fecha_nacimiento', basicInfo.birth_date);
                setStudentField('Telefono', basicInfo.phone);
                setStudentField('Celular', basicInfo.phone);
                setStudentField('Codigo_programa', basicInfo.code_program);
                break;
        }
        if(activeStep < steps.length - 1){
            setActiveStep((prevActiveStep) => prevActiveStep + 1)
        }
    }

    const steps = ["Verificación", "Datos Básicos", "Registro"];

    return (
        <div className="flex items-center justify-center">
            <Stepper steps={steps} activeStep={activeStep}>
                {/* Contenido de cada paso */}
                <Verification 
                    handleNext={handleNext}
                    activeStep={activeStep} 
                    setActiveStep={setActiveStep} 
                    steps={steps}/>
                <BasicData 
                    programs={programs}
                    handleNext={handleNext}
                    steps={steps}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                />
               <Finish 
                    programs={programs}
                    activeStep={activeStep}
                    steps={steps}
                    setActiveStep={setActiveStep}
               />
            </Stepper>
        </div>
    )
}