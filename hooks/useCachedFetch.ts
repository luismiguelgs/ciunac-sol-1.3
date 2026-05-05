'use client'
import React from 'react'
import { StoreApi, UseBoundStore } from 'zustand'
import { CatalogState } from '@/stores/types.stores'

export function useCachedFetch<T>(
  storeFunction: UseBoundStore<StoreApi<CatalogState<T>>>,
  fetcher: () => Promise<T[]>,
) {
  const items = storeFunction((state) => state.data)
  const hasHydrated = storeFunction((state) => state.hasHydrated)
  const [loading, setLoading] = React.useState<boolean>(true)

  React.useEffect(() => {
    let isMounted = true

    const getData = async () => {
      try {
        setLoading(true)
        const result = await fetcher()
        storeFunction.getState().setData(result)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (!hasHydrated) {
      return () => { isMounted = false }
    }

    if (!items || items.length === 0) {
      void getData()
    } else {
        setLoading(false)
    }

    return () => { isMounted = false }
  }, [fetcher, hasHydrated, items, storeFunction])

  return { data: hasHydrated ? items : undefined, loading: !hasHydrated || loading }
}
