import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SolicitudConstanciaDraft } from '@/modules/solicitud-constancia/domain/solicitud-constancia'

export default function SolicitudSummary({ draft }: { draft: SolicitudConstanciaDraft }) {
  const rows = [
    ['Tipo de solicitud', String(draft.tipoSolicitudId)],
    ['Apellidos', draft.apellidos.toLocaleUpperCase()],
    ['Nombres', draft.nombres.toLocaleUpperCase()],
    ['Documento', draft.numeroDocumento],
    ['Celular', draft.celular],
    ['Email', draft.email],
    ['Idioma', String(draft.idiomaId)],
    ['Nivel', String(draft.nivelId)],
    ['Monto pagado', `S/${draft.pago.toFixed(2)}`],
    ['Numero de voucher', draft.numeroVoucher || 'No aplica'],
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
