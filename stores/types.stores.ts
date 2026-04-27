import { ITexto, IFacultad, IIdioma, IEscuela, ITipoSolicitud } from "@/modules/shared/interfaces/types.interface";
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface GenericState<T> {
  data: T[]
  setData: (data: T[]) => void
}

function createGenericStore<T>(name: string) {
  return create<GenericState<T>>()(
    persist(
      (set) => ({
        data: [],
        setData: (data) => set({ data }),
      }),
      {
        name,
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({ data: state.data }),
      },
    ),
  )
}

export const useEscuelasStore = createGenericStore<IEscuela>('escuelas-storage')
export const useTextsStore = createGenericStore<ITexto>('text-storage')
export const useDocumentsStore = createGenericStore<ITipoSolicitud>('documents-storage')
export const useFacultiesStore = createGenericStore<IFacultad>('faculties-storage')
export const useSubjectsStore = createGenericStore<IIdioma>('idiomas-storage')
