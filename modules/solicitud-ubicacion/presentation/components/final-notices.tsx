import MyAlert from '@/components/forms/myAlert'
import { LocationText } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'

export default function FinalNotices({ texts }: { texts: LocationText[] }) {
  return (
    <div className="grid grid-cols-1 gap-1">
      <MyAlert title="Atencion" description={getText(texts, 'TEXTO_UBICACION_3')} type="info" />
      <MyAlert title="Importante" description={getText(texts, 'TEXTO_UBICACION_4')} type="warning" />
    </div>
  )
}

function getText(texts: LocationText[], code: string): string {
  return texts.find((item) => item.code === code)?.content ?? 'Informacion temporalmente no disponible.'
}

