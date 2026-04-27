"use client"

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Control, FieldValues, Path } from "react-hook-form"
import IProgram from "@/modules/solicitud-nuevo/interfaces/programs.interface"
import useSubjects from "@/hooks/useSubjects"
import React from "react"
import { Skeleton } from "../ui/skeleton"
import { getIconByCode } from "@/components/icons/flags"

type Props<T extends FieldValues> = {
    control: Control<T>
    programs? : IProgram[]
    name: Path<T>
    ubicacion?: boolean
}

export function SelectLanguage<T extends FieldValues>({name, control, programs=[], ubicacion=false}:Props<T>) 
{
    const {data, loading} = useSubjects()

    let filteredData = data

    if (ubicacion && data){
        filteredData = data.filter(program => 
            ![1, 5, 6].includes(Number(program.id))
        )
    }

    if(loading){
        return (
            <div className="space-y-2 min-h-[70px]"> {/* Contenedor para simular FormItem */}
                <Skeleton className="h-4 w-20" /> {/* Simula FormLabel */}
                <Skeleton className="h-10 w-full" /> {/* Simula SelectTrigger */}
                <Skeleton className="h-3 w-40" /> {/* Simula FormDescription */}
            </div>
        )
    }
    
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="min-h-[70px]">
                    <FormLabel>Programa</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona un programa" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full min-w-[300px]">
                            {
                                programs.length === 0 ? (
                                    <React.Fragment>
                                        {
                                            filteredData?.map((program, index) => (
                                                <SelectItem key={index} value={String(program.id)} className="py-2">
                                                    <div className="flex items-center gap-3 w-full pl-0.5">
                                                        <div className="flex-shrink-0 transform origin-center scale-150 w-7 h-7 flex items-center justify-center">
                                                            {getIconByCode(String(program.id))}
                                                        </div>
                                                        <span className="flex-1">{program.nombre}</span>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        }
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment>
                                        {
                                            programs?.map((program, index) => (
                                                <SelectItem key={index} value={program.Codigo} className="py-2">
                                                    <div className="flex items-center gap-3 w-full pl-0.5">
                                                        <div className="flex-shrink-0 transform origin-center scale-150 w-7 h-7 flex items-center justify-center">
                                                            {getIconByCode(program.Codigo)}
                                                        </div>
                                                        <span className="flex-1">{program.Nombre}</span>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        }
                                    </React.Fragment>
                                )
                            }
                        </SelectContent>
                    </Select>
                    <FormDescription>
                        Selecciona el idioma.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
