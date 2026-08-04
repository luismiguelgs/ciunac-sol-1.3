'use client'
import React from 'react'
import { StoreApi, UseBoundStore } from 'zustand'
import { CatalogState } from '@/stores/types.stores'
import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error'

export function useCachedFetch<T>(
  storeFunction: UseBoundStore<StoreApi<CatalogState<T>>>,
  fetcher: () => Promise<T[]>,
) {
  const items = storeFunction((state) => state.data)
  const hasHydrated = storeFunction((state) => state.hasHydrated)
  const hasLoaded = storeFunction((state) => state.hasLoaded)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<AppError | null>(null)
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    let isMounted = true

    const getData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await fetcher()
        storeFunction.getState().setData(result)
      } catch (cause) {
        if (isMounted) setError(normalizeAppError(cause, 'No se pudo cargar la informacion'))
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (!hasHydrated) {
      return () => { isMounted = false }
    }

    if (!hasLoaded) {
      void getData()
    } else {
        setLoading(false)
    }

    return () => { isMounted = false }
  }, [attempt, fetcher, hasHydrated, hasLoaded, storeFunction])

  const retry = React.useCallback(() => setAttempt((value) => value + 1), [])

  return {
    data: hasHydrated && hasLoaded ? items : undefined,
    loading: !hasHydrated || loading,
    error,
    retry,
  }
}
