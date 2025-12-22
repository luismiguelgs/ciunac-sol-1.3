import { ITexto, IFacultad, IIdioma, IEscuela, ITipoSolicitud } from "@/interfaces/types.interface";
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface EscuelasState {
  escuelas: IEscuela[]
  setEscuelas: (docs: IEscuela[]) => void
}

export const useEscuelasStore = create<EscuelasState>()(
  persist(
    (set) => ({
      escuelas: [],
      setEscuelas: (escuelas) => set({ escuelas: escuelas }),//set({ bears: get().bears + 1 }),
    }),
    {
      name: 'escuelas-storage', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default the 'localStorage' is used
      partialize: (state) => ({ documents: state.escuelas }),
    },
  ),
)

interface TextsState {
  textos: ITexto[]
  setTextos: (textos: ITexto[]) => void
}

export const useTextsStore = create<TextsState>()(
  persist(
    (set) => ({
      textos: [],
      setTextos: (textos) => set({ textos: textos }),//set({ bears: get().bears + 1 }),
    }),
    {
      name: 'text-storage', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default the 'localStorage' is used
      partialize: (state) => ({ textos: state.textos }),
    },
  ),
)


interface DocsState {
  documents: ITipoSolicitud[]
  setDocuments: (docs: ITipoSolicitud[]) => void
}

export const useDocumentsStore = create<DocsState>()(
  persist(
    (set) => ({
      documents: [],
      setDocuments: (docs) => set({ documents: docs }),//set({ bears: get().bears + 1 }),
    }),
    {
      name: 'documents-storage', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default the 'localStorage' is used
      partialize: (state) => ({ documents: state.documents }),
    },
  ),
)

interface FacusState {
  faculties: IFacultad[]
  setFaculties: (docs: IFacultad[]) => void
}

export const useFacultiesStore = create<FacusState>()(
  persist(
    (set) => ({
      faculties: [],
      setFaculties: (facus) => set({ faculties: facus }),//set({ bears: get().bears + 1 }),
    }),
    {
      name: 'faculties-storage', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default the 'localStorage' is used
      partialize: (state) => ({ documents: state.faculties }),
    },
  ),
)
interface SubjectsState {
  subjects: IIdioma[]
  setSubjects: (subs: IIdioma[]) => void
}

export const useSubjectsStore = create<SubjectsState>()(
  persist(
    (set) => ({
      subjects: [],
      setSubjects: (subs) => set({ subjects: subs }),
    }),
    {
      name: 'idiomas-storage', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default the 'localStorage' is used
      partialize: (state) => ({ documents: state.subjects }),
    },
  ),
)