import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SolicitudBeca } from '@/modules/solicitud-beca/domain/solicitud-beca'

type Props = { solicitud: SolicitudBeca }

const documentRows = [
  ['Constancia de Matrícula', 'enrollmentCertificateUrl'],
  ['Historial Académico', 'academicHistoryUrl'],
  ['Constancia de Tercio / Quinto Superior', 'meritCertificateUrl'],
  ['Carta de Compromiso', 'commitmentLetterUrl'],
  ['Declaración Jurada', 'swornDeclarationUrl'],
] as const

export default function SolicitudSummary({ solicitud }: Props) {
  const { basicData, documents } = solicitud
  const rows = [
    ['Tipo de Solicitud', 'SOLICITUD DE BECA'],
    ['Apellidos', basicData.lastNames.toLocaleUpperCase()],
    ['Nombres', basicData.names.toLocaleUpperCase()],
    ['Celular', basicData.phone],
    ['Tipo de Documento', basicData.documentType],
    ['Documento', basicData.documentNumber],
    ['Facultad', basicData.faculty.name],
    ['Escuela', basicData.school.name],
    ['Código', basicData.studentCode],
    ['Correo', solicitud.email],
    ['Dirección', basicData.address],
  ]

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <h2 className="text-center text-2xl font-bold md:text-left">Datos de la Solicitud</h2>
        <Separator className="my-4" />
      </CardHeader>
      <CardContent className="space-y-2">
        <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 md:text-base">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="font-semibold">{label}:</dt>
              <dd className="text-right">{value}</dd>
            </div>
          ))}
          {documentRows.map(([label, key]) => (
            <div key={key} className="flex justify-between gap-4">
              <dt className="font-semibold">{label}:</dt>
              <dd>
                <Link href={documents[key]} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Ver documento
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
