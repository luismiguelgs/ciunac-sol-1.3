import IcronogramaExam from '../interfaces/cronograma-exam.interface';
import { apiFetch } from '@/lib/api.service'

enum CRUD {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete'
}

export default class CronogramaExamService
{
    private static dataCollection = 'cronogramaubicacion'

    public static async getAll(): Promise<IcronogramaExam[] | undefined> 
    {
        try{
            const res = await apiFetch<IcronogramaExam[]>(this.dataCollection, 'GET')
            return res
        }
        catch(err){
            this.errorHandler(err, CRUD.READ)
        }
    }

    private static errorHandler(err: unknown, operation:string): void {
        if (err instanceof Error) {
            switch (operation){
                case CRUD.CREATE:
                    console.error('Error al crear el elemento:', err.message); 
                    break;
                case CRUD.UPDATE:
                    console.error('Error al actualizar el elemento:', err.message);
                    break;
                case CRUD.DELETE:
                    console.error('Error al borrar el elemento:', err.message);
                    break;
                case CRUD.READ:
                    console.error('Error al cargar el elemento:', err.message);
                    break;
            }
        } else {
            console.error('Error desconocido al actualizar el elemento:', err);
        }
        throw err
    }
}
