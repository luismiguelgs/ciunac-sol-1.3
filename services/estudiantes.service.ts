import IEstudiante from "@/interfaces/estudiante.interface";
import { apiFetch, apiFetchSafe } from "@/lib/api.service";
import IEstudianteQ10 from "@/modules/solicitud-nuevo/interfaces/student.interface";


const collection = 'estudiantes'

export default class EstudiantesService {
    static async fetchItemByDNI(dni: string): Promise<IEstudiante> {
        const data = await apiFetch<IEstudiante>(`${collection}/buscar/${dni}`, 'GET')
        return data
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async updateItem(id: string, body: any): Promise<IEstudiante> {
        const facultadId = body.facultad ? +body.facultad : null
        const escuelaId = body.escuela ? +body.escuela : null

        const estudianteData = {
            nombres: body.nombres,
            apellidos: body.apellidos,
            tipoDocumento: body.tipo_documento,
            numeroDocumento: body.dni,
            celular: body.celular,
            facultadId: facultadId,
            escuelaId: escuelaId,
            codigo: body.codigo
        } as unknown as IEstudiante

        const data = await apiFetch<IEstudiante>(`${collection}/${id}`, 'PATCH', estudianteData)
        return data
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async newItem(body: any): Promise<IEstudiante> {
        const estudianteData = {
            nombres: body.nombres,
            apellidos: body.apellidos,
            tipoDocumento: body.tipo_documento,
            numeroDocumento: body.dni,
            celular: body.celular,
            facultadId: +body.facultad,
            escuelaId: +body.escuela,
            codigo: body.codigo
        } as unknown as IEstudiante

        const data = await apiFetch<IEstudiante>(`${collection}`, 'POST', estudianteData)
        return data
    }

    static async nuevoEstudianteQ10(body: IEstudianteQ10) {
        const result = await apiFetchSafe<IEstudianteQ10>(`q10/estudiantes`, 'POST', body)
        return result
    }
}
