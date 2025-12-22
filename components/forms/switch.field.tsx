"use client"

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Control } from "react-hook-form"

type Props = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<any>
    name: string
    label: string
    description?: string 
}

export default function SwithField({control, name, label, description}:Props) 
{
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
                    <div className="space-y-0.5">
                        <FormLabel>{label}</FormLabel>
                        <FormDescription>
                            {description}
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </FormControl>
                </FormItem>
            )}
        />
    )
}
