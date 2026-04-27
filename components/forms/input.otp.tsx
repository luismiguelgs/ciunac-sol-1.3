import React from 'react'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Control, FieldValues, Path } from 'react-hook-form';

type Props<T extends FieldValues> = {
    name: Path<T>;
    control: Control<T>;
    label: string;
    description?: string;
    disabled?: boolean;
}

export default function MyInputOpt<T extends FieldValues>({control, label, description, name,disabled}:Props<T>) 
{
    return (
        <React.Fragment>
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem className="w-full">
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                            <InputOTP maxLength={4} {...field} disabled={!disabled}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                </InputOTPGroup>
                            </InputOTP>
                        </FormControl>
                        <FormDescription>
                            {description}
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </React.Fragment>
    )
}
