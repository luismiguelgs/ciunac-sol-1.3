import IEstudiante from "@/modules/shared/interfaces/estudiante.interface";
import IEstudianteQ10 from "@/modules/solicitud-nuevo/interfaces/student.interface";
import { StudentFormDto } from '@/modules/shared/infrastructure/dto/student-form.dto';
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository';
import { toStudentRequestDto } from '@/modules/shared/infrastructure/mappers/student-api.mapper';
import { parseExternalResponse, studentResponseSchema } from '@/modules/shared/infrastructure/validation/external-response';

/** DTO para crear/actualizar estudiantes desde formularios */
export type IEstudianteFormDTO = StudentFormDto;

const collection = 'estudiantes'

export default class EstudiantesService {
    static async fetchItemByDNI(dni: string): Promise<IEstudiante> {
        const data = await resourceApiRepository.get<IEstudiante>(`${collection}/buscar/${dni}`)
        return parseExternalResponse(studentResponseSchema, data, 'La API devolvio datos de estudiante no validos') as unknown as IEstudiante
    }

    static async updateItem(id: string, body: IEstudianteFormDTO): Promise<IEstudiante> {
        const estudianteData = toStudentRequestDto(body)
        const data = await resourceApiRepository.update<IEstudiante, typeof estudianteData>(`${collection}/${id}`, estudianteData)
        return parseExternalResponse(studentResponseSchema, data, 'No se pudo confirmar la actualizacion del estudiante') as unknown as IEstudiante
    }

    static async newItem(body: IEstudianteFormDTO): Promise<IEstudiante> {
        const estudianteData = toStudentRequestDto(body)
        const data = await resourceApiRepository.create<IEstudiante, typeof estudianteData>(`${collection}`, estudianteData)
        return parseExternalResponse(studentResponseSchema, data, 'No se pudo confirmar el registro del estudiante') as unknown as IEstudiante
    }

    static async nuevoEstudianteQ10(body: IEstudianteQ10) {
        const result = await resourceApiRepository.postSafe<unknown, IEstudianteQ10>(`q10/estudiantes`, body)
        return result
    }
}

