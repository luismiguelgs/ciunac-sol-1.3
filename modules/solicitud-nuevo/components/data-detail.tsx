import React from 'react'
import IStudent from '../interfaces/student.interface'
import IProgram from '../interfaces/programs.interface'
import { DocumentTypeMap, GenderTypeMap } from '@/lib/constants';
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function DataDetail({student, programs}:{student: IStudent, programs: IProgram[]}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Primer Apellido:</p>
        <p className="text-sm font-semibold">{student.Primer_apellido}</p>
    </div>

    <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Segundo Apellido:</p>
        <p className="text-sm font-semibold">{student.Segundo_apellido}</p>
    </div>

    <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Primer Nombre:</p>
        <p className="text-sm font-semibold">{student.Primer_nombre}</p>
    </div>

    <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Segundo Nombre:</p>
        <p className="text-sm font-semibold">{student.Segundo_nombre}</p>
    </div>

    <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Tipo de Documento:</p>
        <p className="text-sm font-semibold">{DocumentTypeMap[student.Codigo_tipo_identificacion]}</p>
    </div>

    <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Número de Documento:</p>
        <p className="text-sm font-semibold">{student.Numero_identificacion}</p>
    </div>

    <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Género:</p>
        <p className="text-sm font-semibold">{GenderTypeMap[student.Genero]}</p>
    </div>

    <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Fecha de Nacimiento:</p>
        <p className="text-sm font-semibold">{format(new Date(student.Fecha_nacimiento), 'dd/MM/yyyy', { locale: es })}</p>
    </div>

    <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Teléfono:</p>
        <p className="text-sm font-semibold">{student.Telefono}</p>
    </div>

    <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Email:</p>
        <p className="text-sm font-semibold">{student.Email}</p>
    </div>

    <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Programa:</p>
        <p className="text-sm font-semibold">
            {programs.find((p:IProgram) => p.Codigo === student.Codigo_programa)?.Nombre}
        </p>
    </div>
</div>
  )
}
