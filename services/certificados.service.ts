import { ICertificado } from '@/interfaces/certificado.interface';
import { apiFetch } from '@/lib/api.service';

export default class CertificadosService
{
    private static collection = 'certificados'
    
    public static async selectItem(id:string):Promise<ICertificado | undefined>
    {
       const response = await apiFetch<ICertificado>(`${this.collection}/${id}`, 'GET')
       return response
    }

    public static async selectItemBySolicitud(solicitudId: number): Promise<ICertificado | null> {
        try {
            const response = await apiFetch<ICertificado>(`${this.collection}/solicitud/${solicitudId}`, 'GET')
            return response
        } catch (err) {
            if (err instanceof Error) {
                console.error('Error al buscar por id_solicitud:', err.message)
            } else {
                console.error('Error desconocido al buscar por id_solicitud:', err)
            }
            return null
        }
    }

    public static async updateStatus(id:string, status:boolean):Promise<ICertificado | null>
    {
        const data = {
            aceptado : status,
            fechaAceptacion : new Date()
        }
        const response = await apiFetch<ICertificado>(`${this.collection}/${id}`, 'PATCH', data)
        return response 
    }
}