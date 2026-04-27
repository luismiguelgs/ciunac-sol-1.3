'use client'

import { IIdioma } from '@/modules/shared/interfaces/types.interface'
import TypesService, { Collection } from '@/services/types.service'
import { useSubjectsStore } from '@/stores/types.stores'
import { useCachedFetch } from './useCachedFetch'

export default function useSubjects() {
  return useCachedFetch<IIdioma>(
    useSubjectsStore,
    () => TypesService.fetchItems<IIdioma>(Collection.Idiomas)
  )
}
