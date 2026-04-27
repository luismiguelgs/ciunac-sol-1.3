export interface ITexto{
    id?:string,
    codigo:string,
    contenido:string,
    creadoEn?:Date,
    modificadoEn?:Date
}
export interface IBaseData{
    id?: number,
    isNew?:boolean
}
export interface IIdioma extends IBaseData{
    nombre:string
}
export interface IFacultad extends IBaseData{
    nombre:string,
    codigo: string
}
export interface ITipoSolicitud extends IBaseData{ 
    solicitud:string, 
    precio:number
}
export interface ISalon extends IBaseData{
    capacidad: number
}
export interface IEscuela extends IBaseData{
    nombre: string,
    facultadId: number
}
  