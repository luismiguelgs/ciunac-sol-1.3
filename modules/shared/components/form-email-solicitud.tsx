'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import FormEmail from '@/modules/shared/components/email-verification-form';
import { IVerificationSchema } from '@/modules/shared/schemas/verification.schema';

interface FormEmailSolicitudProps {
    path: string;
}

export default function FormEmailSolicitud({ path }: FormEmailSolicitudProps) {
    const router = useRouter();

    const action = (data: IVerificationSchema) => {
        router.push(`/${path}/proceso?email=${encodeURIComponent(data.email)}`);
    };

    return (
        <React.Fragment>
            <FormEmail action={action} />
        </React.Fragment>
    );
}
