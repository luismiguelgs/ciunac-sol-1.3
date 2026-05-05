'use client'

import { IFacultad } from '@/modules/shared/interfaces/types.interface'
import TypesService, { Collection } from '@/services/types.service'
import { useFacultiesStore } from '@/stores/types.stores'
import React from 'react'
import { useCachedFetch } from './useCachedFetch'

export default function useFacultades() {
  const fetchFacultades = React.useCallback(
    () => TypesService.fetchItems<IFacultad>(Collection.Facultades),
    []
  )

  const { data } = useCachedFetch<IFacultad>(
    useFacultiesStore,
    fetchFacultades
  )
  return data
}
