import { create } from 'zustand'
import { AppError } from '@/modules/shared/application/errors/app-error'
import {
  ScholarshipBasicData,
  ScholarshipDocuments,
  SolicitudBeca,
} from '@/modules/solicitud-beca/domain/solicitud-beca'

export type ScholarshipDraft = {
  email: string
  basicData: ScholarshipBasicData | null
  documents: ScholarshipDocuments | null
}

export type ScholarshipWorkflowState =
  | { status: 'initial'; draft: ScholarshipDraft }
  | { status: 'editing'; draft: ScholarshipDraft }
  | { status: 'submitting'; operation: 'registration'; draft: ScholarshipDraft; request: SolicitudBeca }
  | { status: 'submitting'; operation: 'notification'; draft: ScholarshipDraft; requestId: string }
  | { status: 'success'; draft: ScholarshipDraft; requestId: string; receiptId: string }
  | { status: 'saved_notification_failed'; draft: ScholarshipDraft; requestId: string; error: AppError }
  | { status: 'error'; draft: ScholarshipDraft; error: AppError }

type ScholarshipStore = {
  workflow: ScholarshipWorkflowState
  initialize: (email: string) => void
  completeBasicData: (data: ScholarshipBasicData) => void
  completeDocuments: (data: ScholarshipDocuments) => void
  beginRegistration: (request: SolicitudBeca) => void
  completeRegistration: (requestId: string, receiptId: string) => void
  markNotificationFailed: (requestId: string, error: AppError) => void
  beginNotificationRetry: (requestId: string) => void
  markRegistrationFailed: (error: AppError) => void
  reset: () => void
}

const emptyDraft = (): ScholarshipDraft => ({ email: '', basicData: null, documents: null })
const initialWorkflow = (): ScholarshipWorkflowState => ({ status: 'initial', draft: emptyDraft() })

const useSolicitudBecaStore = create<ScholarshipStore>((set) => ({
  workflow: initialWorkflow(),
  initialize: (email) => set({
    workflow: { status: 'editing', draft: { email, basicData: null, documents: null } },
  }),
  completeBasicData: (data) => set((state) => {
    const sameDocument = state.workflow.draft.basicData?.documentNumber === data.documentNumber
    return {
      workflow: {
        status: 'editing',
        draft: {
          email: state.workflow.draft.email,
          basicData: data,
          documents: sameDocument ? state.workflow.draft.documents : null,
        },
      },
    }
  }),
  completeDocuments: (documents) => set((state) => state.workflow.draft.basicData
    ? { workflow: { status: 'editing', draft: { ...state.workflow.draft, documents } } }
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

export default useSolicitudBecaStore
