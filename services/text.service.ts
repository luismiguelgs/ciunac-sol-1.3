import { apiFetch } from "@/lib/api.service";
import { ITexto } from "../interfaces/types.interface";

const collection = 'textos'

export default class TextosService {
    static async fetchItems():Promise<ITexto[]>{
        const data = await apiFetch<ITexto[]>(collection, 'GET')
        return data
    }
}
