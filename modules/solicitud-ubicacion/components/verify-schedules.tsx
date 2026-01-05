'use client'
import React from 'react';
import IcronogramaExam from '../interfaces/cronograma-exam.interface';
import CronogramaExamService from '../services/cronogramaExam.service';
import MyAlert from '@/components/forms/myAlert';
import { Skeleton } from "@/components/ui/skeleton";
import MyTable from '@/components/forms/my-table';
import FormEmailSolicitud from './form-email-solicitud';

export default function VerifySchedules() 
{
    const [cronogramas, setCronogramas] = React.useState<IcronogramaExam[] | undefined>([]);
	const [loading, setLoading] = React.useState(true); // Estado para manejar la carga

    React.useEffect(() => {
		const fetchCronogramas = async () => {
		try {
			const data = await CronogramaExamService.getAll();
			setCronogramas(data);
            console.log(data)
		} catch (error) {
			console.error('Error fetching cronogramas:', error);
		} finally {
			setLoading(false); // Finalizar la carga
		}
		};
		fetchCronogramas();
	}, []);

    const verifySchedules = (cronogramas: IcronogramaExam[]) => {
		for (let i = 0; i < cronogramas.length; i++) {
		    const schedule = cronogramas[i];
		    const active = schedule.activo;
		    if (active) {
			    return true;
		    }
	    }
	    return false; // Retornar false si no hay cronogramas activos
    };

    const schedulesLeft = (cronogramas: IcronogramaExam[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Establece la hora a 00:00:00.000

        // Obtener la fecha de "pasado mañana" (día después de mañana) sin la hora
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(today.getDate() + 2); // Añade dos días a la fecha actual

        // Filtrar los elementos cuya fecha sea posterior a "pasado mañana"
        const filerItem = cronogramas.filter((item) => {
            const itemDate = new Date(item.fecha);
            itemDate.setHours(0, 0, 0, 0); // Eliminar la hora de la fecha del ítem
            return itemDate > dayAfterTomorrow; // Solo fechas posteriores a "pasado mañana"
        });

        // Ordenar por periodo (módulo)

        return filerItem.sort((a,b)=>{
            const periodoA = parseInt(a.modulo.nombre);
            const periodoB = parseInt(b.modulo.nombre);
            return periodoA - periodoB;
        });
    };

    return (
        <React.Fragment>
            {loading ? (
			// Mostrar Skeleton mientras se carga
			<Loading />
		) : verifySchedules(cronogramas as IcronogramaExam[]) ? (
			// Mostrar FormStart si hay cronogramas activos
            <FormEmailSolicitud />
			//<FormStart certificados={certificados} setBloqueo={setBloqueoRep}/>*/}
		) : (
			// Mostrar mensaje y tabla si no hay cronogramas activos
			<div className='mt-2 mb-2 '>
                <MyAlert
					title='Cronogramas'
					description={<>Lo sentimos, en estos momentos no hay cronogramas activos para el examen de ubicación, por favor intente para
					la siguiente fecha, la lista puede verla en el siguiente cuadro, o comuníquese con nosotros a través de nuestro
					al teléfono: <strong>014291931</strong></>}
					type='info'
				/>
                <div className='p-2'></div>
                <MyTable 
                    data={schedulesLeft(cronogramas as IcronogramaExam[])} 
                    columns={[
                        {header: "Módulo", accessor: "modulo", render: (_v, row)=>row.modulo.nombre ?? ""},
                        {header:"Fecha", accessor: "fecha", render:(value)=>{
                            const date = new Date(value as string);
                            return date.toLocaleDateString("es-PE");
                        }}]}
                />
                <div className='p-2'></div>
			</div>
		)}
        </React.Fragment>
    )
}

function Loading() {
    return (
        <div className="w-full p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dos rectángulos que ocupan la mitad de la pantalla */}
                <div>
                    <Skeleton className="w-full h-[100px]" />
                </div>
                <div>
                    <Skeleton className="w-full h-[100px]" />
                </div>
                {/* Dos rectángulos más abajo */}
                <div>
                    <Skeleton className="w-full h-[150px]" />
                </div>
                <div>
                    <Skeleton className="w-full h-[150px]" />
                </div>
            </div>
        </div>
    )
}
