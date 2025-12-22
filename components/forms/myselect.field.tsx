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
import { Control } from "react-hook-form"

type Props = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<any>
    name: string
    label: string
    description?: string
    placeholder?: string
    disabled?: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: any[]
    // Permite definir cómo obtener value/label según el tipo del item
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getOptionValue?: (item: any) => string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getOptionLabel?: (item: any) => string
}

export function MySelect({ name, label, control, options, placeholder, disabled, description, getOptionValue, getOptionLabel }: Props) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="min-h-[70px]">
                    <FormLabel>{label}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
                        <FormControl>
                            <SelectTrigger className="w-full overflow-hidden">
                                <SelectValue placeholder={placeholder} className="text-ellipsis" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full min-w-[300px]">
                            {
                                options?.map((item, index) => {
                                    const value = getOptionValue ? getOptionValue(item) : (item?.value ?? item?.id ?? String(index))
                                    const label = getOptionLabel ? getOptionLabel(item) : (item?.label ?? item?.nombre ?? String(item))
                                    return (
                                        <SelectItem key={index} value={value} className="py-2">
                                            {label}
                                        </SelectItem>
                                    )
                                })
                            }
                        </SelectContent>
                    </Select>
                    <FormDescription>
                        {description}
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}