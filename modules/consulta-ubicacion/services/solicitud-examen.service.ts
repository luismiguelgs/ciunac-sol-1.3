import { IExamenUbicacion, IDetalleExamenUbicacion } from "@/modules/consulta-ubicacion/interfaces/examen.interface";
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository';

export default class SolicitudesExamenService
{
    private static dbExamenesUbicacion = 'examenesubicacion'
    private static dbDetalleExamenesUbicacion = 'detallesubicacion'

    //Examenes - funciones ****************************************
    public static async fetchItems():Promise<IExamenUbicacion[]>{
        try{
            const data = await resourceApiRepository.list<IExamenUbicacion>(this.dbExamenesUbicacion)
            return data
        }
        catch(err){
            if (err instanceof Error) {
                console.error('Error al actualizar el elemento:', err.message);
            } else {
                console.error('Error desconocido al actualizar el elemento:', err);
            }
            throw err
        }
    }
    //Calificaciones Detalle - funciones ************************
    public static async fetchItemsDetail(dni: string):Promise<IDetalleExamenUbicacion[]>
    {
        console.info('fetchItemsDetail', dni)
        try{
            const data = await resourceApiRepository.get<IDetalleExamenUbicacion[]>(`${this.dbDetalleExamenesUbicacion}/estudiante/documento/${dni}`)
            return data
        }
        catch(err){
            if (err instanceof Error) {
                console.error('Error al actualizar el elemento:', err.message);
            } else {
                console.error('Error desconocido al actualizar el elemento:', err);
            }
            throw err
        }
    }
}

