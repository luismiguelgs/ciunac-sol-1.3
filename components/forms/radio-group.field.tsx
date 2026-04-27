"use client"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Control, FieldValues, Path } from "react-hook-form"

type Props<T extends FieldValues> = {
    control: Control<T>
    options: { value: string; label: string }[]
    label: string
    name: Path<T>
}

export function RadioGroupField<T extends FieldValues>({ control, label, name, options }:Props<T>) 
{
    return (
        <FormField
            control={control}
            name={name}
            defaultValue={options[0].value as import("react-hook-form").PathValue<T, import("react-hook-form").Path<T>>}
            render={({ field }) => (
            <FormItem className="space-y-3">
                <FormLabel>{label}</FormLabel>
                <FormControl>
                    <RadioGroup
                        orientation="horizontal"
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                    >
                        {options.map((option,index) => (
                            <FormItem className="flex items-center space-x-3 space-y-0" key={index}>
                                <FormControl>
                                    <RadioGroupItem value={option.value} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                    {option.label}
                                </FormLabel>
                            </FormItem>
                        ))}
                    </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
    )
}
