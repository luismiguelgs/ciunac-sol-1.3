'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import FormEmail from '@/modules/shared/components/email-verification-form';
import { OtpPurpose } from '@/modules/security/domain/security.types';

interface FormEmailSolicitudProps {
    path: string;
    purpose: OtpPurpose;
}

export default function FormEmailSolicitud({ path, purpose }: FormEmailSolicitudProps) {
    const router = useRouter();

    const action = () => {
        router.push(`/${path}/proceso`);
    };

    return (
        <React.Fragment>
            <FormEmail action={action} purpose={purpose} />
        </React.Fragment>
    );
}
