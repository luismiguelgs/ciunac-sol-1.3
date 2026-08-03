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
            throw err
        }
    }
    //Calificaciones Detalle - funciones ************************
    public static async fetchItemsDetail(dni: string):Promise<IDetalleExamenUbicacion[]>
    {
        try{
            const data = await resourceApiRepository.get<IDetalleExamenUbicacion[]>(`${this.dbDetalleExamenesUbicacion}/estudiante/documento/${dni}`)
            return data
        }
        catch(err){
            throw err
        }
    }
}

