export default interface IcronogramaExam {
    id?: number;
    moduloId: number;
    fecha: string;
    activo: boolean;
    creadoEn: string;
    modificadoEn: string;
    modulo:{
        id: number;
        nombre: string;
    }
}
