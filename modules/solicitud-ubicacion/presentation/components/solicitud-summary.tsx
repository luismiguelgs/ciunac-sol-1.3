import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { LocationCatalogs, SolicitudUbicacion } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'

export default function SolicitudSummary({ solicitud, catalogs }: { solicitud: SolicitudUbicacion; catalogs: LocationCatalogs }) {
  const { basicData, payment } = solicitud
  const language = catalogs.languages.find((item) => item.id === basicData.languageId)?.name ?? String(basicData.languageId)
  const level = ['No disponible', 'BASICO', 'INTERMEDIO', 'AVANZADO'][basicData.levelId]
  const rows = [
    ['Tipo de solicitud', catalogs.requestType.name],
    ['Idioma', language],
    ['Nivel', level],
    ['Apellidos', basicData.lastNames.toLocaleUpperCase()],
    ['Nombres', basicData.names.toLocaleUpperCase()],
    ['Documento', `${basicData.documentType}: ${basicData.documentNumber}`],
    ['Celular', basicData.phone],
    ['Correo', solicitud.email],
    ['Alumno CIUNAC', solicitud.isCiunacStudent ? 'Si' : 'No'],
    ['Pago', `S/${payment.amount.toFixed(2)}`],
    ['Numero de voucher', payment.voucher?.number ?? 'No aplica'],
  ]
  return (
    <Card className="shadow-lg">
      <CardHeader><h2 className="text-center text-2xl font-bold md:text-left">Datos de la solicitud</h2><Separator className="my-4" /></CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 md:text-base">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4"><dt className="font-semibold">{label}:</dt><dd className="text-right">{value}</dd></div>
          ))}
          <FileRow label="Documento de identidad" url={basicData.identityDocumentUrl} />
          {solicitud.studyCertificateUrl ? <FileRow label="Certificado de estudios" url={solicitud.studyCertificateUrl} /> : null}
          {payment.voucher ? <FileRow label="Voucher" url={payment.voucher.url} /> : null}
        </dl>
      </CardContent>
    </Card>
  )
}

function FileRow({ label, url }: { label: string; url: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="font-semibold">{label}:</dt>
      <dd><Link href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver archivo</Link></dd>
    </div>
  )
}

