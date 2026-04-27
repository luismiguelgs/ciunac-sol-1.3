'use client'

import { IFacultad } from '@/modules/shared/interfaces/types.interface'
import TypesService, { Collection } from '@/services/types.service'
import { useFacultiesStore } from '@/stores/types.stores'
import { useCachedFetch } from './useCachedFetch'

export default function useFacultades() {
  const { data } = useCachedFetch<IFacultad>(
    useFacultiesStore,
    () => TypesService.fetchItems<IFacultad>(Collection.Facultades)
  )
  return data
}
