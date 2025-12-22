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
import { Skeleton } from "@/components/ui/skeleton" // 1. Importa Skeleton
import useFacultades from "@/hooks/useFacultades"
import { Control } from "react-hook-form"

type Props = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<any>
    name: string
    disabled?: boolean
}

export default function SelectFacultad({name, control, disabled=false}:Props) 
{
    const data = useFacultades()

    // 2. Muestra el Skeleton si no hay datos
    if (!data) {
        return (
            <div className="space-y-2 min-h-[70px] pt-[9px]"> {/* Contenedor para simular FormItem */}
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
                <FormItem className="min-h-[70px] mt-2">
                    <FormLabel>Facultad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
                        <FormControl>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona una facultad" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full min-w-[300px]">
                            {
                                // Filtrar el array para excluir el item con value 'PAR' antes de mapear
                                data?.filter(item => item.codigo !== 'PAR')
                                    .map((item, index) => (
                                        <SelectItem key={item.codigo ?? index} value={String(item.id)} className="py-2">
                                            {item.nombre}
                                        </SelectItem>
                                    ))
                            }
                        </SelectContent>
                    </Select>
                    <FormDescription>
                        Selecciona su facultad.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
