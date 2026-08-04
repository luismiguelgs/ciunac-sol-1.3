import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { externalRecordArraySchema, parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'

export enum Collection {
    Tiposolicitud = 'tipossolicitud',
    Facultades = 'facultades',
    Idiomas = 'idiomas',
    Salones = 'salones',
    Escuelas = 'escuelas',
}

export default class TypesService
{
    static async fetchItems<T>(collection:Collection):Promise<T[]>{
        const data = await resourceApiRepository.list<T>(collection)
        return parseExternalResponse(externalRecordArraySchema, data, 'La API devolvio un catalogo no valido') as unknown as T[]
    }
}


  
