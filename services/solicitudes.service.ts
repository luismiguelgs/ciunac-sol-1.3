import Isolicitud, { ISolicitudRes } from '@/modules/shared/interfaces/solicitud.interface';
import ISolicitudBeca from '@/modules/solicitud-beca/interfaces/solicitudbeca.interface';
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository';
import { toSolicitudBecaRequestDto, toSolicitudRequestDto } from '@/modules/shared/infrastructure/mappers/solicitud-api.mapper';

export default class SolicitudesService {
    private static collection = 'solicitudes'

    public static async searchItemByDni(dni: string): Promise<ISolicitudRes[]> {
        const response = await resourceApiRepository.get<ISolicitudRes[]>(`${this.collection}/documento/${dni}`)
        return response
    }

    public static async newItem(data: Isolicitud): Promise<string | null> {
        const solicitudData = toSolicitudRequestDto(data)
        const response = await resourceApiRepository.create<{ id: string }, typeof solicitudData>(`${this.collection}`, solicitudData)
        return response.id
    }

    public static async getItemId(id: number): Promise<ISolicitudRes> {
        const response = await resourceApiRepository.get<ISolicitudRes>(`${this.collection}/${id}`)
        return response
    }

    public static async newBeca(data: ISolicitudBeca): Promise<string | undefined> {
        const solicitudData = toSolicitudBecaRequestDto(data)
        const response = await resourceApiRepository.create<ISolicitudBeca, typeof solicitudData>(`solicitudbecas`, solicitudData)
        return response?._id
    }
}
