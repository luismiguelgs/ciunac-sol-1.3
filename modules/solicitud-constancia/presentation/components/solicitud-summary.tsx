import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SolicitudConstancia } from '@/modules/solicitud-constancia/domain/solicitud-constancia'

export default function SolicitudSummary({ solicitud }: { solicitud: SolicitudConstancia }) {
  const rows = [
    ['Tipo de solicitud', String(solicitud.basicData.typeId)],
    ['Apellidos', solicitud.basicData.lastNames.toLocaleUpperCase()],
    ['Nombres', solicitud.basicData.names.toLocaleUpperCase()],
    ['Documento', solicitud.basicData.documentNumber],
    ['Celular', solicitud.basicData.phone],
    ['Email', solicitud.email],
    ['Idioma', String(solicitud.basicData.languageId)],
    ['Nivel', String(solicitud.basicData.levelId)],
    ['Monto pagado', `S/${solicitud.payment.amount.toFixed(2)}`],
    ['Numero de voucher', solicitud.payment.voucher?.number ?? 'No aplica'],
  ]

  return (
    <Card className="shadow-lg">
      <CardHeader><CardTitle>Datos de la Solicitud de Constancia</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 md:text-base">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <span className="font-semibold">{label}:</span>
            <span className="text-right">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
