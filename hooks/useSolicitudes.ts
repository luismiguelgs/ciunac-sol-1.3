'use client'

import { ITipoSolicitud } from '@/modules/shared/interfaces/types.interface'
import TypesService, { Collection } from '@/services/types.service'
import { useDocumentsStore } from '@/stores/types.stores'
import React from 'react'
import { useCachedFetch } from './useCachedFetch'

export default function useSolicitudes() {
  const fetchSolicitudes = React.useCallback(
    () => TypesService.fetchItems<ITipoSolicitud>(Collection.Tiposolicitud),
    []
  )

  const { data } = useCachedFetch<ITipoSolicitud>(
    useDocumentsStore,
    fetchSolicitudes
  )
  return data
}
