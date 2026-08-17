import MyAlert from '@/components/forms/myAlert'
import type { ConstanciaText } from '@/modules/solicitud-constancia/domain/solicitud-constancia'

export default function FinalNotices({ texts }: { texts: ConstanciaText[] }) {
  return (
    <div className="grid grid-cols-1 gap-1">
      <MyAlert title="Atencion" description={getText(texts, 'TEXTO_1_FINAL')} type="info" />
      <MyAlert title="Importante" description={getText(texts, 'TEXTO_1_DISCLAMER')} type="warning" />
      <MyAlert title="Importante" description={getText(texts, 'TEXTO_2_DISCLAMER')} type="warning" />
    </div>
  )
}

function getText(texts: ConstanciaText[], code: string): string {
  return texts.find((item) => item.code === code)?.content ?? 'Informacion temporalmente no disponible.'
}
