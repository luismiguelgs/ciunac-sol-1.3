import { DocumentType, Gender } from "@/lib/constants";

export default interface IEstudianteQ10 {
    Codigo_estudiante?: string;
    Primer_apellido: string;
    Segundo_apellido: string;
    Primer_nombre: string;
    Segundo_nombre?: string;
    Email: string;
    Codigo_tipo_identificacion: DocumentType;
    Numero_identificacion: string;
    Genero: Gender;
    Fecha_nacimiento: string; //"1995-03-04T00:00:00-00:00",
    Telefono: string;  //igual a celular
    Celular: string;  //igual a telefono
    Lugar_nacimiento?:string; // "15001",
    Direccion?: string// "Lima",
    Lugar_residencia?: string; //"15001",
    Codigo_programa: string //"ING-R", //Seleccionar el programa
    Consecutivo_periodo?:number; //await getPeriod(), //buscar el ultimo periodo
    Consecutivo_sedejornada?: number; // 7
}