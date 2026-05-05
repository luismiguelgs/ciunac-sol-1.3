'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import FormEmail from '@/modules/shared/components/email-verification-form';
import { IVerificationSchema } from '@/modules/shared/schemas/verification.schema';

export default function FormEmailSolicitud()
{
    const router = useRouter();

    const action = (data: IVerificationSchema) => {
        router.push(`/solicitud-certificados/proceso?email=${encodeURIComponent(data.email)}`);
    };

    return (
        <React.Fragment> 
            <FormEmail action={action} />
        </React.Fragment>
    );
}
