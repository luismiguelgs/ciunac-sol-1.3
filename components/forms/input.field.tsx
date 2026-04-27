'use client'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "../ui/input";
import React from "react";
import { Control, FieldValues, Path } from "react-hook-form";
import { Mail, Phone } from "lucide-react"

interface OmitInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {}

interface Props<T extends FieldValues> extends OmitInputProps {
    name: Path<T>;
	placeholder?: string;
	type?: 'text' | 'email' | 'password' | 'number ' | 'tel' ;
	control: Control<T>;
	disabled?: boolean;
	inputRef?: React.RefObject<HTMLInputElement>;
	label?: string;
	description?: string;	
}

export default function InputField<T extends FieldValues>({ control, type='text', disabled=false, inputRef, label, description, name, placeholder }: Props<T>)
{
    let info:{label:string, placeholder:string, icon:React.ReactNode};

    switch (type) {
        case 'email':
            info = {
                label: 'Correo Electrónico',
                placeholder: 'Ingrese su correo electrónico...',
                icon: <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            }
            break;
        case 'tel':
            info = {
                label: 'Teléfono',
                placeholder: 'Ingrese su teléfono celular...',
                icon: <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /> 	
            }
            break;
    }
    return(
        type === 'text' ? (
            <>
                <FormField
                    control={control}
                    name={name}
                    render={({ field }) => {
                        
                        return (
                            <FormItem className="min-h-[70px]">
                                <FormLabel>{label}</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        type={type}
                                        placeholder={placeholder} 
                                        disabled={disabled} 
                                        ref={inputRef} 
                                    />
                                </FormControl>
                                <FormDescription>{description}</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )
                    }}
                />
            </>
        ):(
            <>
            	<FormField
                    control={control}
                    name={name}
                    render={({ field }) => (
                        <FormItem className="min-h-[70px]">
                            <FormLabel>{info.label}</FormLabel>
                            <FormControl>
                                <div className="relative">
                                {info.icon}
                                    <Input 
                                        {...field} 
                                        type={type}
                                        className="pl-10"
                                        placeholder={info.placeholder} 
                                        disabled={disabled} 
                                        ref={inputRef} 
                                        autoComplete="off"
                                    />
                                </div>
                            </FormControl>
                            <FormDescription>{description}</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </>
        )
    )
}