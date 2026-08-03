import IcronogramaExam from '@/modules/solicitud-ubicacion/interfaces/cronograma-exam.interface';
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'

export default class CronogramaExamService
{
    private static dataCollection = 'cronogramaubicacion'

    public static async getAll(): Promise<IcronogramaExam[] | undefined> 
    {
        try{
            const res = await resourceApiRepository.list<IcronogramaExam>(this.dataCollection)
            return res
        }
        catch(err){
            throw err
        }
    }
}


