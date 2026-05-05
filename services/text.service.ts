import { ITexto } from "@/modules/shared/interfaces/types.interface";
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository';

const collection = 'textos'

export default class TextosService {
    static async fetchItems():Promise<ITexto[]>{
        const data = await resourceApiRepository.list<ITexto>(collection)
        return data
    }
}

