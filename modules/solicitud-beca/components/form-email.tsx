'use client'

import { useRouter } from 'next/navigation'; // 1. Importa useRouter
import FormEmail from '@/modules/shared/components/email-verification-form';

export default function FormEmailBecas()
{
    const router = useRouter(); // 2. Inicializa el router

    const action = () => {
        router.push('/solicitud-beca/proceso');
    }

    return (
        <FormEmail action={action} purpose="BECA" />
    )
}
