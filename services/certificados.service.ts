import { ICertificado } from '@/modules/shared/interfaces/certificado.interface';
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository';

export default class CertificadosService
{
    private static collection = 'certificados'
    
    public static async selectItem(id:string):Promise<ICertificado | undefined>
    {
       const response = await resourceApiRepository.get<ICertificado>(`${this.collection}/${id}`)
       return response
    }

    public static async selectItemBySolicitud(solicitudId: number): Promise<ICertificado | null> {
        try {
            const response = await resourceApiRepository.get<ICertificado>(`${this.collection}/solicitud/${solicitudId}`)
            return response
        } catch {
            return null
        }
    }

    public static async updateStatus(id:string, status:boolean):Promise<ICertificado | null>
    {
        const data = {
            aceptado : status,
            fechaAceptacion : new Date()
        }
        const response = await resourceApiRepository.update<ICertificado, typeof data>(`${this.collection}/${id}`, data)
        return response 
    }
}
