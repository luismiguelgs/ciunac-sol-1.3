'use client'

import { ITexto } from '@/modules/shared/interfaces/types.interface'
import TextosService from '@/services/text.service'
import { useTextsStore } from '@/stores/types.stores'
import React from 'react'
import { useCachedFetch } from './useCachedFetch'

export default function useTexts() {
  const fetchTexts = React.useCallback(() => TextosService.fetchItems(), [])

  const { data } = useCachedFetch<ITexto>(
    useTextsStore,
    fetchTexts
  )
  return data
}

