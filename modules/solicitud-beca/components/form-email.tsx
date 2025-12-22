'use client'

import { useRouter } from 'next/navigation'; // 1. Importa useRouter
import FormEmail from '@/components/form-email';
import { IVerificationSchema } from '@/schemas/verification.schema';

export default function FormEmailBecas()
{
    const router = useRouter(); // 2. Inicializa el router

    const action = (data: IVerificationSchema) => {
        const email = data.email;
        router.push(`/solicitud-beca/proceso?email=${encodeURIComponent(email)}`);
    }

    return (
        <FormEmail action={action} />
    )
}