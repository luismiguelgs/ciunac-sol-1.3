import IEstudiante from "@/modules/shared/interfaces/estudiante.interface";
import { apiFetch, apiFetchSafe } from "@/lib/api.service";
import IEstudianteQ10 from "@/modules/solicitud-nuevo/interfaces/student.interface";

/** DTO para crear/actualizar estudiantes desde formularios */
export interface IEstudianteFormDTO {
    nombres: string;
    apellidos: string;
    tipo_documento: string;
    dni: string;
    celular: string;
    facultad?: string;
    escuela?: string;
    codigo?: string;
}

const collection = 'estudiantes'

export default class EstudiantesService {
    static async fetchItemByDNI(dni: string): Promise<IEstudiante> {
        const data = await apiFetch<IEstudiante>(`${collection}/buscar/${dni}`, 'GET')
        return data
    }

    static async updateItem(id: string, body: IEstudianteFormDTO): Promise<IEstudiante> {
        const estudianteData: Partial<IEstudiante> = {
            nombres: body.nombres.toUpperCase(),
            apellidos: body.apellidos.toUpperCase(),
            tipoDocumento: body.tipo_documento as IEstudiante['tipoDocumento'],
            numeroDocumento: body.dni,
            celular: body.celular,
            facultadId: body.facultad ? +body.facultad : undefined,
            escuelaId: body.escuela ?? undefined,
            codigo: body.codigo
        }

        const data = await apiFetch<IEstudiante>(`${collection}/${id}`, 'PATCH', estudianteData)
        return data
    }

    static async newItem(body: IEstudianteFormDTO): Promise<IEstudiante> {
        const estudianteData: Partial<IEstudiante> = {
            nombres: body.nombres.toUpperCase(),
            apellidos: body.apellidos.toUpperCase(),
            tipoDocumento: body.tipo_documento as IEstudiante['tipoDocumento'],
            numeroDocumento: body.dni,
            celular: body.celular,
            facultadId: body.facultad ? +body.facultad : undefined,
            escuelaId: body.escuela ?? undefined,
            codigo: body.codigo ?? undefined
        }

        const data = await apiFetch<IEstudiante>(`${collection}`, 'POST', estudianteData)
        return data
    }

    static async nuevoEstudianteQ10(body: IEstudianteQ10) {
        const result = await apiFetchSafe<IEstudianteQ10>(`q10/estudiantes`, 'POST', body)
        return result
    }
}

