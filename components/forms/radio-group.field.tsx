"use client"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Control } from "react-hook-form"

type Props = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<any>
    options: { value: string; label: string }[]
    label: string
    name: string
}

export function RadioGroupField({ control, label, name, options }:Props) 
{
    return (
        <FormField
            control={control}
            name={name}
            defaultValue={options[0].value}
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
