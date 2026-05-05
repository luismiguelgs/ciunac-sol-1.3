'use client'

import { IIdioma } from '@/modules/shared/interfaces/types.interface'
import TypesService, { Collection } from '@/services/types.service'
import { useSubjectsStore } from '@/stores/types.stores'
import React from 'react'
import { useCachedFetch } from './useCachedFetch'

export default function useSubjects() {
  const fetchSubjects = React.useCallback(
    () => TypesService.fetchItems<IIdioma>(Collection.Idiomas),
    []
  )

  return useCachedFetch<IIdioma>(
    useSubjectsStore,
    fetchSubjects
  )
}
