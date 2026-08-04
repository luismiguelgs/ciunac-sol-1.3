import { ITexto } from "@/modules/shared/interfaces/types.interface";
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository';
import { externalRecordArraySchema, parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response';

const collection = 'textos'

export default class TextosService {
    static async fetchItems():Promise<ITexto[]>{
        const data = await resourceApiRepository.list<ITexto>(collection)
        return parseExternalResponse(externalRecordArraySchema, data, 'La API devolvio textos no validos') as unknown as ITexto[]
    }
}

