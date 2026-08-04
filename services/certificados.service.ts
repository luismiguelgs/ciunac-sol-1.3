import { ICertificado } from '@/modules/shared/interfaces/certificado.interface';
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository';
import { externalRecordSchema, parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response';

export default class CertificadosService
{
    private static collection = 'certificados'
    
    public static async selectItem(id:string):Promise<ICertificado | undefined>
    {
       const response = await resourceApiRepository.get<ICertificado>(`${this.collection}/${id}`)
       return parseExternalResponse(externalRecordSchema, response, 'La API devolvio un certificado no valido') as unknown as ICertificado
    }

    public static async selectItemBySolicitud(solicitudId: number): Promise<ICertificado | null> {
        const response = await resourceApiRepository.getOptional<unknown>(`${this.collection}/solicitud/${solicitudId}`)
        if (response === null) return null
        return parseExternalResponse(externalRecordSchema, response, 'La API devolvio un certificado no valido') as unknown as ICertificado
    }

    public static async updateStatus(id:string, status:boolean):Promise<void>
    {
        const data = {
            aceptado : status,
            fechaAceptacion : new Date()
        }
        await resourceApiRepository.updateCommand(`${this.collection}/${id}`, data)
    }
}
