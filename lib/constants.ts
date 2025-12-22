'use client'

export enum DocumentType {
    PE01 = "PE01", //DNI
    PE02 = "PE02" //CE
}
export const DocumentTypeMap: Record<DocumentType, string> = {
    [DocumentType.PE01]: "DNI",
    [DocumentType.PE02]: "C.E."
}
export enum Gender {
    F = "F", //Femenino
    M = "M" //Masculino
}
export const GenderTypeMap: Record<Gender, string> = {
    [Gender.F]: "FEMENINO",
    [Gender.M]: "MASCULINO"
}

export const NIVEL = [
    {value:'1',label:'BÁSICO'},
    {value:'2',label:'INTERMEDIO'},
    {value:'3',label:'AVANZADO'},
]