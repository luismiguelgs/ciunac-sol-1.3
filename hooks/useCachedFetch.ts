'use client'
import React from 'react'
import { StoreApi, UseBoundStore } from 'zustand'
import { CatalogState } from '@/stores/types.stores'
import { AppError, normalizeAppError } from '@/modules/shared/application/errors/app-error'

type CachedFetchOptions = {
  revalidateOnMount?: boolean
}

export function useCachedFetch<T>(
  storeFunction: UseBoundStore<StoreApi<CatalogState<T>>>,
  fetcher: () => Promise<T[]>,
  options: CachedFetchOptions = {},
) {
  const items = storeFunction((state) => state.data)
  const hasHydrated = storeFunction((state) => state.hasHydrated)
  const hasLoaded = storeFunction((state) => state.hasLoaded)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<AppError | null>(null)
  const [attempt, setAttempt] = React.useState(0)
  const hasRevalidated = React.useRef(false)
  const handledAttempt = React.useRef(0)
  const revalidateOnMount = options.revalidateOnMount ?? false

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

    const shouldRevalidate = revalidateOnMount && !hasRevalidated.current
    const shouldRetry = attempt > handledAttempt.current

    if (!hasLoaded || shouldRevalidate || shouldRetry) {
      if (shouldRevalidate) hasRevalidated.current = true
      if (shouldRetry) handledAttempt.current = attempt
      void getData()
    } else {
      setLoading(false)
    }

    return () => { isMounted = false }
  }, [attempt, fetcher, hasHydrated, hasLoaded, revalidateOnMount, storeFunction])

  const retry = React.useCallback(() => setAttempt((value) => value + 1), [])

  return {
    data: hasHydrated && hasLoaded ? items : undefined,
    loading: !hasHydrated || loading,
    error,
    retry,
  }
}
