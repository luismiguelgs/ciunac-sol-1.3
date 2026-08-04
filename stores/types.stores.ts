import { ITexto, IFacultad, IIdioma, IEscuela, ITipoSolicitud } from "@/modules/shared/interfaces/types.interface";
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CatalogState<T> {
  data: T[]
  hasHydrated: boolean
  hasLoaded: boolean
  setHasHydrated: (value: boolean) => void
  setData: (data: T[]) => void
  clearData: () => void
}

function createGenericStore<T>(name: string) {
  return create<CatalogState<T>>()(
    persist(
      (set) => ({
        data: [],
        hasHydrated: false,
        hasLoaded: false,
        setHasHydrated: (value) => set({ hasHydrated: value }),
        setData: (data) => set({ data, hasLoaded: true }),
        clearData: () => set({ data: [], hasLoaded: false }),
      }),
      {
        name,
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({ data: state.data, hasLoaded: state.hasLoaded }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true)
        },
      },
    ),
  )
}

export const useEscuelasStore = createGenericStore<IEscuela>('escuelas-storage')
export const useTextsStore = createGenericStore<ITexto>('text-storage')
export const useDocumentsStore = createGenericStore<ITipoSolicitud>('documents-storage')
export const useFacultiesStore = createGenericStore<IFacultad>('faculties-storage')
export const useSubjectsStore = createGenericStore<IIdioma>('idiomas-storage')
