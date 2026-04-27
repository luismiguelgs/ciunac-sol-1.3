export interface ICertificado{
    _id?:string,
    tipo: 'VIRTUAL' | 'FISICO',
    periodo: string,
    estudiante: string,
    numeroDocumento: string,
	idiomaId: number,
	idioma: string,
	nivel: string,
	nivelId: number,
	cantidadHoras: number,
	solicitudId: number,
	fechaEmision: string,
	numeroRegistro: string,
	fechaConcluido: string,
	curriculaAnterior: boolean,
	impreso: boolean,
	duplicado: boolean,
	certificadoOriginal: string,
	elaboradoPor: string,
	url: string,
	aceptado: boolean,
    fechaAceptacion: string,
    notas:ICertificadoNota[],
    creado_en: string,
    modificado_en: string,
}
export interface ICertificadoNota{
    ciclo: string,
    periodo: string,
    modalidad: string
    nota: number,
    	
}