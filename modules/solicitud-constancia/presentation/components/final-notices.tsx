'use client'

import MyAlert from '@/components/forms/myAlert'
import { useCatalogStore } from '@/hooks/useCatalogStore'
import { useTextsStore } from '@/stores/types.stores'

export default function FinalNotices() {
  const { data: textos } = useCatalogStore(useTextsStore)
  const message = (code: string) => textos?.find((item) => item.codigo === code)?.contenido

  return (
    <div className="grid grid-cols-1 gap-1">
      <MyAlert title="Atencion" description={message('TEXTO_1_FINAL')} type="info" />
      <MyAlert title="Importante" description={message('TEXTO_1_DISCLAMER')} type="warning" />
      <MyAlert title="Importante" description={message('TEXTO_2_DISCLAMER')} type="warning" />
    </div>
  )
}
