import { ITexto } from '@/interfaces/types.interface';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { initialValues, IsolicitudUbicacionSchema, solicitudUbicacionSchema } from '../schemas/solicitud-ubicacion.schema';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import React from 'react';
import MyAlert from '@/components/forms/myAlert';
import SwithField from '@/components/forms/switch.field';

type Props = {
    open: boolean;
    text: ITexto[] | undefined;
    action: (alumno_ciunac: boolean) => void;
}

export default function DialogInfoAdicional({ open, text, action }: Props) {
    const form = useForm({
        resolver: zodResolver(solicitudUbicacionSchema),
        defaultValues: initialValues
    });

    const onSubmit = (data: IsolicitudUbicacionSchema) => {
        action(data.alumno_ciunac);
    };

    return (
        <AlertDialog open={open}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Verificación de información adicional</AlertDialogTitle>
                    <AlertDialogDescription>
                        Verificar la siguiente información antes de iniciar el proceso de solicitud.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className='space-y-4'>
                            <React.Suspense fallback={<div>Loading...</div>}>
                                <MyAlert
                                    title='Alumno ciunac'
                                    description={text?.find(objeto => objeto.codigo === 'TEXTO_UBICACION_1')?.contenido}
                                    type='info' />
                            </React.Suspense>
                            <div className="flex items-center space-x-2 w-full">
                                <SwithField
                                    control={form.control}
                                    name='alumno_ciunac'
                                    label='Alunno CIUNAC'
                                    description='Si es alumno CIUNAC, seleccione esta opción.'
                                />
                            </div>
                        </div>
                        <AlertDialogFooter className='pt-2'>
                            <AlertDialogAction type='submit'>Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                    </form>
                </FormProvider>
            </AlertDialogContent>
        </AlertDialog>
    )
}
