"use client";

import React from "react";
import { Button } from "@/components/ui/button"

// Definir las props que el componente Stepper recibirá
interface StepperProps {
    steps: string[]; // Array de las etiquetas de cada paso
    children: React.ReactNode[]; // El contenido de cada paso
    activeStep: number; // El paso actual
}

export const Stepper: React.FC<StepperProps> = ({ steps, children, activeStep}) => {
    // Calculamos el ancho de cada sección basado en el número de pasos
    const stepWidth = `${100 / steps.length}%`;
    
    return (
        <div className="w-full max-w-5xl mx-auto p-2">
            {/* Encabezado del Stepper */}
            <div className="flex justify-center items-center relative w-full px-2 md:px-4">
                <div className="relative w-full max-w-2xl">
                    {/* Línea de fondo que atraviesa todos los pasos */}
                    <div className="absolute top-4 md:top-5 left-[20px] md:left-[25px] right-[20px] md:right-[25px] h-[2px] bg-border" />
                    
                    {/* Línea de progreso que muestra hasta dónde ha avanzado */}
                    <div 
                        className="absolute top-4 md:top-5 left-[20px] md:left-[25px] h-[2px] bg-primary transition-all duration-300 ease-in-out" 
                        style={{ width: `calc(${(activeStep / (steps.length - 1)) * 100}% - ${activeStep === steps.length - 1 ? 40 : 20}px)` }}
                    />
                    
                    {/* Contenedor de los círculos */}
                    <div className="flex justify-between w-full relative z-10">
                        {steps.map((label, index) => (
                        <div key={index} className="flex flex-col items-center" style={{ width: stepWidth }}>
                            {/* Círculo del paso */}
                            <div
                            className={`w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full border-2 bg-background
                                ${index < activeStep ? "border-primary bg-primary text-primary-foreground" : 
                                  index === activeStep ? "border-primary bg-primary text-primary-foreground" : 
                                  "border-muted-foreground text-muted-foreground"}`}
                            >
                            {index + 1}
                            </div>
                            <span className="mt-2 text-xs md:text-sm text-center min-h-[40px] px-1">{label}</span>
                        </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contenido del paso actual */}
            <div className="mt-8 p-4 border rounded">
                {children[activeStep]}
            </div>           
        </div>
    );
};

interface StepperControlProps {
    activeStep: number;
    steps: string[];
    setActiveStep: React.Dispatch<React.SetStateAction<number>>;
    type?: "button" | "submit";
    disabled?: boolean; 
}

export function StepperControl({ activeStep, steps, setActiveStep, type = "button" , disabled=false}: StepperControlProps) {
    const handleNext = () => {
        if (type === "button") {
            setActiveStep(prev => prev + 1);
        }
        // If type is submit, the form's onSubmit handler will handle the step change
    }

    return (
        <div className="mt-8 flex justify-between">
            <Button
                onClick={() => setActiveStep(prev => prev - 1)}
                disabled={activeStep === 0 || disabled}
                variant="outline"
                type="button"
            >
                Anterior
            </Button>
            <Button
                onClick={type === "button" ? handleNext : undefined}
                disabled={disabled}
                type={type}
            >
                {activeStep === steps.length - 1 ? "Finalizar" : "Siguiente"}
            </Button>
        </div>
    )
}