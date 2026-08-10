import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { NewStudent } from '@/modules/solicitud-nuevo/domain/new-student'

type Props = {
  student: NewStudent
}

const genderNames = { F: 'FEMENINO', M: 'MASCULINO' } as const

export default function NewStudentSummary({ student }: Props) {
  const rows = [
    ['Primer Apellido', student.firstLastName],
    ['Segundo Apellido', student.secondLastName],
    ['Primer Nombre', student.firstName],
    ['Segundo Nombre', student.secondName ?? 'No consignado'],
    ['Tipo de Documento', student.document.type],
    ['Número de Documento', student.document.number],
    ['Género', genderNames[student.gender]],
    ['Fecha de Nacimiento', format(new Date(`${student.birthDate}T00:00:00`), 'dd/MM/yyyy', { locale: es })],
    ['Teléfono', student.phone],
    ['Email', student.email],
    ['Programa', student.program.name],
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label} className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}:</p>
          <p className="text-sm font-semibold">{value}</p>
        </div>
      ))}
    </div>
  )
}
