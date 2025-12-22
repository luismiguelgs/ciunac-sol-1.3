import { apiFetch } from '@/lib/api.service'

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
        const data = await apiFetch<T[]>(collection, 'GET')
        return data
    }
}


  