import IEstudiante from "@/modules/shared/interfaces/estudiante.interface";
import IEstudianteQ10 from "@/modules/solicitud-nuevo/interfaces/student.interface";
import { StudentFormDto } from '@/modules/shared/infrastructure/dto/student-form.dto';
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository';
import { toStudentRequestDto } from '@/modules/shared/infrastructure/mappers/student-api.mapper';

/** DTO para crear/actualizar estudiantes desde formularios */
export type IEstudianteFormDTO = StudentFormDto;

const collection = 'estudiantes'

export default class EstudiantesService {
    static async fetchItemByDNI(dni: string): Promise<IEstudiante> {
        const data = await resourceApiRepository.get<IEstudiante>(`${collection}/buscar/${dni}`)
        return data
    }

    static async updateItem(id: string, body: IEstudianteFormDTO): Promise<IEstudiante> {
        const estudianteData = toStudentRequestDto(body)
        const data = await resourceApiRepository.update<IEstudiante, typeof estudianteData>(`${collection}/${id}`, estudianteData)
        return data
    }

    static async newItem(body: IEstudianteFormDTO): Promise<IEstudiante> {
        const estudianteData = toStudentRequestDto(body)
        const data = await resourceApiRepository.create<IEstudiante, typeof estudianteData>(`${collection}`, estudianteData)
        return data
    }

    static async nuevoEstudianteQ10(body: IEstudianteQ10) {
        const result = await resourceApiRepository.postSafe<IEstudianteQ10, IEstudianteQ10>(`q10/estudiantes`, body)
        return result
    }
}

