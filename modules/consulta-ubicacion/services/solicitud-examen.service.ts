import { IExamenUbicacion, IDetalleExamenUbicacion } from "@/modules/consulta-ubicacion/interfaces/examen.interface";
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository';
import { externalRecordArraySchema, parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response';

export default class SolicitudesExamenService
{
    private static dbExamenesUbicacion = 'examenesubicacion'
    private static dbDetalleExamenesUbicacion = 'detallesubicacion'

    //Examenes - funciones ****************************************
    public static async fetchItems():Promise<IExamenUbicacion[]>{
        const data = await resourceApiRepository.list<IExamenUbicacion>(this.dbExamenesUbicacion)
        return parseExternalResponse(externalRecordArraySchema, data, 'La API devolvio examenes no validos') as unknown as IExamenUbicacion[]
    }
    //Calificaciones Detalle - funciones ************************
    public static async fetchItemsDetail(dni: string):Promise<IDetalleExamenUbicacion[]>
    {
        const data = await resourceApiRepository.get<IDetalleExamenUbicacion[]>(`${this.dbDetalleExamenesUbicacion}/estudiante/documento/${dni}`)
        return parseExternalResponse(externalRecordArraySchema, data, 'La API devolvio notas no validas') as unknown as IDetalleExamenUbicacion[]
    }
}

