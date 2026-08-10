import { create } from 'zustand'
import { AppError } from '@/modules/shared/application/errors/app-error'
import {
  ConstanciaBasicData,
  ConstanciaPayment,
  SolicitudConstancia,
} from '@/modules/solicitud-constancia/domain/solicitud-constancia'

export type ConstanciaDraft = {
  email: string
  basicData: ConstanciaBasicData | null
  payment: ConstanciaPayment | null
}

export type ConstanciaWorkflowState =
  | { status: 'initial'; draft: ConstanciaDraft }
  | { status: 'editing'; draft: ConstanciaDraft }
  | { status: 'submitting'; operation: 'registration'; draft: ConstanciaDraft; request: SolicitudConstancia }
  | { status: 'submitting'; operation: 'notification'; draft: ConstanciaDraft; requestId: string }
  | { status: 'success'; draft: ConstanciaDraft; requestId: string; receiptId: string }
  | { status: 'saved_notification_failed'; draft: ConstanciaDraft; requestId: string; error: AppError }
  | { status: 'error'; draft: ConstanciaDraft; error: AppError }

type StoreState = {
  workflow: ConstanciaWorkflowState
  initialize: (email: string) => void
  completeBasicData: (data: ConstanciaBasicData) => void
  completePayment: (data: ConstanciaPayment) => void
  beginRegistration: (request: SolicitudConstancia) => void
  completeRegistration: (requestId: string, receiptId: string) => void
  markNotificationFailed: (requestId: string, error: AppError) => void
  beginNotificationRetry: (requestId: string) => void
  markRegistrationFailed: (error: AppError) => void
  reset: () => void
}

const emptyDraft = (): ConstanciaDraft => ({ email: '', basicData: null, payment: null })
const initialWorkflow = (): ConstanciaWorkflowState => ({ status: 'initial', draft: emptyDraft() })

const useSolicitudConstanciaStore = create<StoreState>((set) => ({
  workflow: initialWorkflow(),
  initialize: (email) => set({
    workflow: {
      status: 'editing',
      draft: { email, basicData: null, payment: null },
    },
  }),
  completeBasicData: (data) => set((state) => ({
    workflow: {
      status: 'editing',
      draft: {
        email: state.workflow.draft.email,
        basicData: data,
        payment: null,
      },
    },
  })),
  completePayment: (data) => set((state) => state.workflow.draft.basicData
    ? {
        workflow: {
          status: 'editing',
          draft: { ...state.workflow.draft, payment: data },
        },
      }
    : state),
  beginRegistration: (request) => set((state) => ({
    workflow: {
      status: 'submitting',
      operation: 'registration',
      draft: state.workflow.draft,
      request,
    },
  })),
  completeRegistration: (requestId, receiptId) => set((state) => ({
    workflow: {
      status: 'success',
      draft: state.workflow.draft,
      requestId,
      receiptId,
    },
  })),
  markNotificationFailed: (requestId, error) => set((state) => ({
    workflow: {
      status: 'saved_notification_failed',
      draft: state.workflow.draft,
      requestId,
      error,
    },
  })),
  beginNotificationRetry: (requestId) => set((state) => ({
    workflow: {
      status: 'submitting',
      operation: 'notification',
      draft: state.workflow.draft,
      requestId,
    },
  })),
  markRegistrationFailed: (error) => set((state) => ({
    workflow: {
      status: 'error',
      draft: state.workflow.draft,
      error,
    },
  })),
  reset: () => set({ workflow: initialWorkflow() }),
}))

export default useSolicitudConstanciaStore
