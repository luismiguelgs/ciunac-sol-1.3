import React from 'react'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Control } from 'react-hook-form';

type Props = {
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<any>;
    label: string;
    description?: string;
    disabled?: boolean;
}

export default function MyInputOpt({control, label, description, name,disabled}:Props) 
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
