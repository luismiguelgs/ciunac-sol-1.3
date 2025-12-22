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
import useSolicitudes from "@/hooks/useSolicitudes"
import { Control } from "react-hook-form"

type Props = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<any>
    name: string
}

export default function SelectSolicitud({name, control}:Props) 
{
    const data = useSolicitudes()

    // 2. Muestra el Skeleton si no hay datos
    if (!data) {
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
                <FormItem className="min-h-[70px]"> {/* Eliminado el mt-2 */}
                    <FormLabel>Solicitud</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona una solicitud" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full min-w-[300px]">
                            {
                                // Filtrar el array para excluir el item con value 'PAR' antes de mapear
                                data?.filter(item => item.id !== 7 && item.id !== 8)
                                    .map((item, index) => (
                                        <SelectItem key={item.id ?? index} value={String(item.id)} className="py-2">
                                            {item.solicitud}
                                        </SelectItem>
                                    ))
                            }
                        </SelectContent>
                    </Select>
                    <FormDescription>
                        Selecciona su Tipo de solicitud.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
