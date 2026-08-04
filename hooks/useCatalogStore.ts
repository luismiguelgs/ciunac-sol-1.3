'use client'

import { StoreApi, UseBoundStore } from 'zustand';
import { CatalogState } from '@/stores/types.stores';

export function useCatalogStore<T>(
  store: UseBoundStore<StoreApi<CatalogState<T>>>
) {
  const data = store((state) => state.data);
  const hasHydrated = store((state) => state.hasHydrated);
  const hasLoaded = store((state) => state.hasLoaded);

  return {
    data: hasHydrated && hasLoaded ? data : undefined,
    hasHydrated,
    hasLoaded,
  };
}
