'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import FormEmail from '@/components/form-email';
import { IVerificationSchema } from '@/schemas/verification.schema';
import useStore from '@/hooks/useStore';
import { useTextsStore } from '@/stores/types.stores';
import TextosService from '@/services/text.service';

export default function FormEmailSolicitud()
{
    let textos = useStore(useTextsStore, (state) => state.textos)
    const router = useRouter();

    React.useEffect(()=>{
        const texts = async () => {
            textos = await TextosService.fetchItems()
            useTextsStore.setState({ textos: textos })
        }
        if(!textos) texts()
    },[])

    const action = (data: IVerificationSchema) => {
        router.push(`/solicitud-certificados/proceso?email=${encodeURIComponent(data.email)}`);
    };

    return (
        <React.Fragment> 
            <FormEmail action={action} />
        </React.Fragment>
    );
}