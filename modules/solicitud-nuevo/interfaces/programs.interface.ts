export default interface IProgram{
    Codigo: string;
    Nombre: string;
    Abreviatura : string;
    Numero_resolucion: string;
    Fecha_resolucion: string;
    Aplica_preinscripcion: boolean;
    Aplica_grupo: boolean;
    Tipo_evaluacion : boolean;
    Numero_creditos : number;
    Aplica_para_snies : boolean;
    Aplica_para_siet: boolean;
    Aplica_para : boolean;
    Codigo_snies: string;
    Estado: boolean;
}