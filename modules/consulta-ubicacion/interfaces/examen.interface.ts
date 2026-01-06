export interface IExamenUbicacion{
    id?:number,
    codigo: string,
    fecha: Date | string,
    estadoId: number,
    idiomaId: number,
    docenteId: string,
    aulaId: number,
    creadoEn?:Date,
    modificadoEn?:Date,
    estado?:{
        id:number,
        nombre:string,
    },
    idioma?:{
        id:number,
        nombre:string,
    },
    nivel?:{
        id:number,
        nombre:string,
    },
    docente?:{
        id:string,
        nombres:string,
        apellidos:string,
    }
    aula?:{
        id:number,
        nombre: string
    }
}
export interface IDetalleExamenUbicacion{
    id?: number,
    examenId: number,
    solicitudId: number,
    idiomaId: number,
    nivelId: number,
    estudianteId: string,
    nota: number,
    calificacionId: number,
    terminado: boolean,
    creadoEn?: Date,
    modificadoEn?: Date,
    estudiante?:{
        id:string,
        nombres:string,
        apellidos:string,
        numeroDocumento: string
    }
    idioma?:{
        id:number,
        nombre:string, 
    }
    nivel?:{
        id:number,
        nombre:string,
    }
    calificacion?:{
        id:number,
        cicloId:number
    }
    activo?: boolean
}