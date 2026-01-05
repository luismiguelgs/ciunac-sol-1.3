'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import FormEmail from '@/components/form-email';
import { IVerificationSchema } from '@/schemas/verification.schema';
import DialogInfoAdicional from './dialog-info';
import useStore from '@/hooks/useStore';
import { useTextsStore } from '@/stores/types.stores';
import TextosService from '@/services/text.service';

export default function FormEmailSolicitud()
{
    let textos = useStore(useTextsStore, (state) => state.textos)
    const router = useRouter();

    React.useEffect(()=>{
        const texts = async () => {
            textos = await TextosService.fetchItems();
            useTextsStore.setState({ textos: textos })
        }
        if(!textos) texts()
    },[])

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