import { IConstancia } from '@/modules/shared/interfaces/constancia.interface'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { externalRecordSchema, parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'

export default class ConstanciasService {
    private static collection = 'constancias'

    public static async selectItemBySolicitud(solicitudId: number): Promise<IConstancia | null> {
        const response = await resourceApiRepository.getOptional<unknown>(`${this.collection}/solicitud/${solicitudId}`)
        if (response === null) return null

        const item = Array.isArray(response) ? response[0] : response
        if (item === undefined || item === null) return null
        return parseExternalResponse(externalRecordSchema, item, 'La API devolvio una constancia no valida') as unknown as IConstancia
    }

    public static async updateStatus(id: string, status: boolean): Promise<void> {
        const data = {
            aceptado: status,
            fechaAceptacion: new Date(),
        }

        await resourceApiRepository.updateCommand(`${this.collection}/${id}`, data)
    }
}
