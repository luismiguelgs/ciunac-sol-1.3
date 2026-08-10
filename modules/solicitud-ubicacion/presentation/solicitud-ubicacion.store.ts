import { create } from 'zustand'
import { AppError } from '@/modules/shared/application/errors/app-error'
import {
  LocationBasicData,
  LocationPayment,
  SolicitudUbicacion,
} from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'

export type LocationDraft = {
  email: string
  isCiunacStudent: boolean
  basicData: LocationBasicData | null
  payment: LocationPayment | null
  studyCertificateUrl: string | null
}

export type LocationWorkflowState =
  | { status: 'initial'; draft: LocationDraft }
  | { status: 'editing'; draft: LocationDraft }
  | { status: 'submitting'; operation: 'registration'; draft: LocationDraft; request: SolicitudUbicacion }
  | { status: 'submitting'; operation: 'notification'; draft: LocationDraft; requestId: string }
  | { status: 'success'; draft: LocationDraft; requestId: string; receiptId: string }
  | { status: 'saved_notification_failed'; draft: LocationDraft; requestId: string; error: AppError }
  | { status: 'error'; draft: LocationDraft; error: AppError }

type LocationStore = {
  workflow: LocationWorkflowState
  initialize: (email: string, isCiunacStudent: boolean) => void
  completeBasicData: (data: LocationBasicData) => void
  completePayment: (payment: LocationPayment) => void
  completeStudyCertificate: (url: string) => void
  beginRegistration: (request: SolicitudUbicacion) => void
  completeRegistration: (requestId: string, receiptId: string) => void
  markNotificationFailed: (requestId: string, error: AppError) => void
  beginNotificationRetry: (requestId: string) => void
  markRegistrationFailed: (error: AppError) => void
  reset: () => void
}

const emptyDraft = (): LocationDraft => ({
  email: '',
  isCiunacStudent: false,
  basicData: null,
  payment: null,
  studyCertificateUrl: null,
})
const initialWorkflow = (): LocationWorkflowState => ({ status: 'initial', draft: emptyDraft() })

const useSolicitudUbicacionStore = create<LocationStore>((set) => ({
  workflow: initialWorkflow(),
  initialize: (email, isCiunacStudent) => set({
    workflow: {
      status: 'editing',
      draft: { email, isCiunacStudent, basicData: null, payment: null, studyCertificateUrl: null },
    },
  }),
  completeBasicData: (data) => set((state) => {
    const sameDocument = state.workflow.draft.basicData?.documentNumber === data.documentNumber
    return {
      workflow: {
        status: 'editing',
        draft: {
          ...state.workflow.draft,
          basicData: data,
          payment: sameDocument ? state.workflow.draft.payment : null,
          studyCertificateUrl: sameDocument ? state.workflow.draft.studyCertificateUrl : null,
        },
      },
    }
  }),
  completePayment: (payment) => set((state) => state.workflow.draft.basicData
    ? { workflow: { status: 'editing', draft: { ...state.workflow.draft, payment } } }
    : state),
  completeStudyCertificate: (url) => set((state) => state.workflow.draft.basicData
    ? { workflow: { status: 'editing', draft: { ...state.workflow.draft, studyCertificateUrl: url } } }
    : state),
  beginRegistration: (request) => set((state) => ({
    workflow: { status: 'submitting', operation: 'registration', draft: state.workflow.draft, request },
  })),
  completeRegistration: (requestId, receiptId) => set((state) => ({
    workflow: { status: 'success', draft: state.workflow.draft, requestId, receiptId },
  })),
  markNotificationFailed: (requestId, error) => set((state) => ({
    workflow: { status: 'saved_notification_failed', draft: state.workflow.draft, requestId, error },
  })),
  beginNotificationRetry: (requestId) => set((state) => ({
    workflow: { status: 'submitting', operation: 'notification', draft: state.workflow.draft, requestId },
  })),
  markRegistrationFailed: (error) => set((state) => ({
    workflow: { status: 'error', draft: state.workflow.draft, error },
  })),
  reset: () => set({ workflow: initialWorkflow() }),
}))

export default useSolicitudUbicacionStore

