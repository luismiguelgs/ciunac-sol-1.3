'use client'

import { ITexto } from '@/modules/shared/interfaces/types.interface'
import TextosService from '@/services/text.service'
import { useTextsStore } from '@/stores/types.stores'
import { useCachedFetch } from './useCachedFetch'

export default function useTexts() {
  const { data } = useCachedFetch<ITexto>(
    useTextsStore,
    () => TextosService.fetchItems()
  )
  return data
}

