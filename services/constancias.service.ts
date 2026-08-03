import { IConstancia } from '@/modules/shared/interfaces/constancia.interface'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'

export default class ConstanciasService {
    private static collection = 'constancias'

    public static async selectItemBySolicitud(solicitudId: number): Promise<IConstancia | null> {
        try {
            const response = await resourceApiRepository.get<IConstancia | IConstancia[] | null>(`${this.collection}/solicitud/${solicitudId}`)

            if (Array.isArray(response)) {
                return response[0] ?? null
            }

            return response
        } catch {
            return null
        }
    }

    public static async updateStatus(id: string, status: boolean): Promise<IConstancia | null> {
        const data = {
            aceptado: status,
            fechaAceptacion: new Date(),
        }

        const response = await resourceApiRepository.update<IConstancia, typeof data>(`${this.collection}/${id}`, data)
        return response
    }
}
