'use client'

import { StoreApi, UseBoundStore } from 'zustand';
import { CatalogState } from '@/stores/types.stores';

export function useCatalogStore<T>(
  store: UseBoundStore<StoreApi<CatalogState<T>>>
) {
  const data = store((state) => state.data);
  const hasHydrated = store((state) => state.hasHydrated);

  return {
    data: hasHydrated ? data : undefined,
    hasHydrated,
  };
}
