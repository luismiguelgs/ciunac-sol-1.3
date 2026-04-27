export default interface IEstudiante {
    id?:string,
    nombres:string,
    apellidos:string,
    genero:string,
    fechaNacimiento:Date,
    tipoDocumento: 'DNI' | 'CE' | 'PASAPORTE',
    numeroDocumento:string,
    celular:string,
    imgDoc?:string,
    facultadId?:number,
    escuelaId?:string,
    direccion?:string,
    codigo?:string,
    creado_en?:Date,
    modificado_en?:Date
}