import IcronogramaExam from '@/modules/solicitud-ubicacion/interfaces/cronograma-exam.interface';
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { externalRecordArraySchema, parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'

export default class CronogramaExamService
{
    private static dataCollection = 'cronogramaubicacion'

    public static async getAll(): Promise<IcronogramaExam[]>
    {
        const res = await resourceApiRepository.list<IcronogramaExam>(this.dataCollection)
        return parseExternalResponse(externalRecordArraySchema, res, 'La API devolvio cronogramas no validos') as unknown as IcronogramaExam[]
    }
}


