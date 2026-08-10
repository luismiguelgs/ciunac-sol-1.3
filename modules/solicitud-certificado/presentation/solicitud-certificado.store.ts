import { create } from 'zustand'
import { AppError } from '@/modules/shared/application/errors/app-error'
import {
  CertificateBasicData,
  CertificatePayment,
  SolicitudCertificado,
} from '@/modules/solicitud-certificado/domain/solicitud-certificado'

export type CertificateDraft = {
  email: string
  basicData: CertificateBasicData | null
  payment: CertificatePayment | null
}

export type CertificateWorkflowState =
  | { status: 'initial'; draft: CertificateDraft }
  | { status: 'editing'; draft: CertificateDraft }
  | { status: 'submitting'; operation: 'registration'; draft: CertificateDraft; request: SolicitudCertificado }
  | { status: 'submitting'; operation: 'notification'; draft: CertificateDraft; requestId: string }
  | { status: 'success'; draft: CertificateDraft; requestId: string; receiptId: string }
  | { status: 'saved_notification_failed'; draft: CertificateDraft; requestId: string; error: AppError }
  | { status: 'error'; draft: CertificateDraft; error: AppError }

type CertificateStore = {
  workflow: CertificateWorkflowState
  initialize: (email: string) => void
  completeBasicData: (data: CertificateBasicData) => void
  completePayment: (payment: CertificatePayment) => void
  beginRegistration: (request: SolicitudCertificado) => void
  completeRegistration: (requestId: string, receiptId: string) => void
  markNotificationFailed: (requestId: string, error: AppError) => void
  beginNotificationRetry: (requestId: string) => void
  markRegistrationFailed: (error: AppError) => void
  reset: () => void
}

const emptyDraft = (): CertificateDraft => ({ email: '', basicData: null, payment: null })
const initialWorkflow = (): CertificateWorkflowState => ({ status: 'initial', draft: emptyDraft() })

const useSolicitudCertificadoStore = create<CertificateStore>((set) => ({
  workflow: initialWorkflow(),
  initialize: (email) => set({
    workflow: { status: 'editing', draft: { email, basicData: null, payment: null } },
  }),
  completeBasicData: (data) => set((state) => {
    const previous = state.workflow.draft.basicData
    const keepsPayment = previous?.documentNumber === data.documentNumber && previous.typeId === data.typeId
    return {
      workflow: {
        status: 'editing',
        draft: {
          email: state.workflow.draft.email,
          basicData: data,
          payment: keepsPayment ? state.workflow.draft.payment : null,
        },
      },
    }
  }),
  completePayment: (payment) => set((state) => state.workflow.draft.basicData
    ? { workflow: { status: 'editing', draft: { ...state.workflow.draft, payment } } }
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

export default useSolicitudCertificadoStore
