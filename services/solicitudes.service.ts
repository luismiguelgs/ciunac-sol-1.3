import Isolicitud, { ISolicitudRes } from '@/modules/shared/interfaces/solicitud.interface';
import ISolicitudBeca from '@/modules/solicitud-beca/interfaces/solicitudbeca.interface';
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository';
import { toSolicitudBecaRequestDto, toSolicitudRequestDto } from '@/modules/shared/infrastructure/mappers/solicitud-api.mapper';
import {
    externalRecordArraySchema,
    externalRecordSchema,
    parseExternalResponse,
    requestIdResponseSchema,
    scholarshipIdResponseSchema,
} from '@/modules/shared/infrastructure/validation/external-response';

export default class SolicitudesService {
    private static collection = 'solicitudes'

    public static async searchItemByDni(dni: string): Promise<ISolicitudRes[]> {
        const response = await resourceApiRepository.get<ISolicitudRes[]>(`${this.collection}/documento/${dni}`)
        return parseExternalResponse(externalRecordArraySchema, response, 'La API devolvio una lista de solicitudes no valida') as unknown as ISolicitudRes[]
    }

    public static async newItem(data: Isolicitud): Promise<string | null> {
        const solicitudData = toSolicitudRequestDto(data)
        const response = await resourceApiRepository.create<unknown, typeof solicitudData>(`${this.collection}`, solicitudData)
        return parseExternalResponse(requestIdResponseSchema, response, 'No se pudo confirmar el identificador de la solicitud').id
    }

    public static async getItemId(id: number): Promise<ISolicitudRes> {
        const response = await resourceApiRepository.get<ISolicitudRes>(`${this.collection}/${id}`)
        return parseExternalResponse(externalRecordSchema, response, 'La API devolvio una solicitud no valida') as unknown as ISolicitudRes
    }

    public static async newBeca(data: ISolicitudBeca): Promise<string | undefined> {
        const solicitudData = toSolicitudBecaRequestDto(data)
        const response = await resourceApiRepository.create<unknown, typeof solicitudData>(`solicitudbecas`, solicitudData)
        const parsed = parseExternalResponse(scholarshipIdResponseSchema, response, 'No se pudo confirmar el identificador de la beca')
        return parsed._id ?? parsed.id
    }
}
