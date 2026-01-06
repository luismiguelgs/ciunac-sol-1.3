import { apiFetch } from "@/lib/api.service";
import { IExamenUbicacion, IDetalleExamenUbicacion } from "../interfaces/examen.interface";

export default class SolicitudesExamenService
{
    private static dbExamenesUbicacion = 'examenesubicacion'
    private static dbDetalleExamenesUbicacion = 'detallesubicacion'

    //Examenes - funciones ****************************************
    public static async fetchItems():Promise<IExamenUbicacion[]>{
        try{
            const data = await apiFetch<IExamenUbicacion[]>(this.dbExamenesUbicacion, 'GET')
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
            const data = await apiFetch<IDetalleExamenUbicacion[]>(`${this.dbDetalleExamenesUbicacion}/estudiante/documento/${dni}`, 'GET')
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