import { create } from 'zustand'
import { SolicitudConstanciaDraft } from '@/modules/solicitud-constancia/domain/solicitud-constancia'

type State = {
  draft: Partial<SolicitudConstanciaDraft>
  updateDraft: (values: Partial<SolicitudConstanciaDraft>) => void
  reset: (email?: string) => void
}

const initialDraft: Partial<SolicitudConstanciaDraft> = {
  email: '',
  alumnoUnac: false,
  pago: 0,
}

const useSolicitudConstanciaStore = create<State>((set) => ({
  draft: initialDraft,
  updateDraft: (values) => set((state) => ({ draft: { ...state.draft, ...values } })),
  reset: (email = '') => set({ draft: { ...initialDraft, email } }),
}))

export default useSolicitudConstanciaStore
