'use client'

import { ITipoSolicitud } from '@/modules/shared/interfaces/types.interface'
import TypesService, { Collection } from '@/services/types.service'
import { useDocumentsStore } from '@/stores/types.stores'
import { useCachedFetch } from './useCachedFetch'

export default function useSolicitudes() {
  const { data } = useCachedFetch<ITipoSolicitud>(
    useDocumentsStore,
    () => TypesService.fetchItems<ITipoSolicitud>(Collection.Tiposolicitud)
  )
  return data
}
