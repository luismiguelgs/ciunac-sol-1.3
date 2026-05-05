'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import FormEmail from '@/modules/shared/components/email-verification-form';
import { IVerificationSchema } from '@/modules/shared/schemas/verification.schema';
import DialogInfoAdicional from './dialog-info';
import useTexts from '@/hooks/useTexts';

export default function FormEmailSolicitud()
{
    const textos = useTexts()
    const router = useRouter();

    const [open, setOpen] = React.useState(false);
    const [email, setEmail] = React.useState('');

    const action = (data: IVerificationSchema) => {
        setEmail(data.email);
        setOpen(true);
    };
    
    const redireccionar = ( alumno_ciunac:boolean) => {
        router.push(
            `/solicitud-ubicacion/proceso?email=${encodeURIComponent(email)}&alumno_ciunac=${encodeURIComponent(alumno_ciunac)}`);
        setOpen(false);
    };

    return (
        <React.Fragment> 
            <FormEmail action={action} />
            <DialogInfoAdicional open={open} text={textos} action={redireccionar}/>
        </React.Fragment>
    );
}
