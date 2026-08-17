import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type {
  ConstanciaCatalogs,
  SolicitudConstancia,
} from '@/modules/solicitud-constancia/domain/solicitud-constancia'

type Props = { solicitud: SolicitudConstancia; catalogs: ConstanciaCatalogs }

export default function SolicitudSummary({ solicitud, catalogs }: Props) {
  const { basicData, payment } = solicitud
  const requestType = catalogs.requestTypes.find((item) => item.id === basicData.typeId)?.name ?? String(basicData.typeId)
  const language = catalogs.languages.find((item) => item.id === basicData.languageId)?.name ?? String(basicData.languageId)
  const level = [{ id: 1, name: 'BASICO' }, { id: 2, name: 'INTERMEDIO' }, { id: 3, name: 'AVANZADO' }]
    .find((item) => item.id === basicData.levelId)?.name ?? String(basicData.levelId)
  const faculty = basicData.isUnacStudent
    ? catalogs.faculties.find((item) => item.id === basicData.facultyId)?.name ?? ''
    : 'No aplica'
  const school = basicData.isUnacStudent
    ? catalogs.schools.find((item) => item.id === basicData.schoolId)?.name ?? ''
    : 'No aplica'
  const rows = [
    ['Tipo de solicitud', requestType],
    ['Idioma', language],
    ['Nivel', level],
    ['Apellidos', basicData.lastNames.toLocaleUpperCase()],
    ['Nombres', basicData.names.toLocaleUpperCase()],
    ['Documento', `${basicData.documentType}: ${basicData.documentNumber}`],
    ['Celular', basicData.phone],
    ['Correo', solicitud.email],
    ['Alumno UNAC', basicData.isUnacStudent ? 'Si' : 'No'],
    ['Facultad', faculty],
    ['Escuela', school],
    ['Codigo', basicData.isUnacStudent ? basicData.studentCode : 'No aplica'],
    ['Monto pagado', `S/${payment.amount.toFixed(2)}`],
    ['Numero de voucher', payment.voucher?.number ?? 'No aplica'],
  ]

  return (
    <Card className="shadow-lg">
      <CardHeader><CardTitle>Datos de la Solicitud de Constancia</CardTitle></CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 md:text-base">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="font-semibold">{label}:</dt>
              <dd className="text-right">{value}</dd>
            </div>
          ))}
          {payment.voucher ? (
            <div className="flex justify-between gap-4">
              <dt className="font-semibold">Voucher:</dt>
              <dd><Link href={payment.voucher.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver archivo</Link></dd>
            </div>
          ) : null}
        </dl>
      </CardContent>
    </Card>
  )
}
