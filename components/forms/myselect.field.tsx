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

type Props<T extends FieldValues, OptionType = unknown> = {
    control: Control<T>
    name: Path<T>
    label: string
    description?: string
    placeholder?: string
    disabled?: boolean
    options?: OptionType[]
    // Permite definir cómo obtener value/label según el tipo del item
    getOptionValue?: (item: OptionType) => string
    getOptionLabel?: (item: OptionType) => string
}

export function MySelect<T extends FieldValues, OptionType = unknown>({ name, label, control, options, placeholder, disabled, description, getOptionValue, getOptionLabel }: Props<T, OptionType>) {
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
                                    const record = item as Record<string, unknown>;
                                    const value = getOptionValue ? getOptionValue(item) : (String(record?.value ?? record?.id ?? index))
                                    const label = getOptionLabel ? getOptionLabel(item) : (String(record?.label ?? record?.nombre ?? item))
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