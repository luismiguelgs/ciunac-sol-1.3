'use client'
import React from 'react'
import useStore from './useStore'
import { StoreApi, UseBoundStore } from 'zustand'

interface CachedStore<T> {
  data: T[]
  setData: (items: T[]) => void
}

export function useCachedFetch<T>(
  storeFunction: UseBoundStore<StoreApi<CachedStore<T>>>,
  fetcher: () => Promise<T[]>,
) {
  const items = useStore(storeFunction, (state) => state.data)
  const [data, setData] = React.useState<T[] | undefined>(items)
  const [loading, setLoading] = React.useState<boolean>(items ? items.length === 0 : true)

  React.useEffect(() => {
    let isMounted = true

    const getData = async () => {
      try {
        setLoading(true)
        const result = await fetcher()
        storeFunction.setState({ data: result })
        if (isMounted) setData(result)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (!items || items.length === 0) {
      void getData()
    } else if (items.length > 0 && !data) {
      setData(items)
      setLoading(false)
    } else {
        setLoading(false)
    }

    return () => { isMounted = false }
  }, [items])

  return { data, loading }
}
