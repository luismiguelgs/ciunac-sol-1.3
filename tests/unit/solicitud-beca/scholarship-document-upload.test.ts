import { describe, expect, it } from 'vitest'
import { MAX_SCHOLARSHIP_DOCUMENT_BYTES } from '@/modules/solicitud-beca/domain/scholarship-document-policy'
import { validateScholarshipDocumentUpload } from '@/modules/solicitud-beca/infrastructure/validation/scholarship-document-upload'

describe('scholarship document upload validation', () => {
  it('accepts a PDF with matching extension, MIME and signature', async () => {
    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])], 'documento.pdf', {
      type: 'application/pdf',
    })
    await expect(validateScholarshipDocumentUpload(formDataWith(file))).resolves.toBe(file)
  })

  it.each([
    ['documento.png', 'image/png', [0x89, 0x50, 0x4e, 0x47]],
    ['documento.png', 'application/pdf', [0x25, 0x50, 0x44, 0x46, 0x2d]],
    ['documento.pdf', 'application/pdf', [0x00, 0x01, 0x02, 0x03, 0x04]],
  ])('rejects incompatible or forged file %s', async (name, type, bytes) => {
    const file = new File([new Uint8Array(bytes)], name, { type })
    await expect(validateScholarshipDocumentUpload(formDataWith(file))).rejects.toMatchObject({ code: 'INVALID_FILE' })
  })

  it('rejects a missing or empty file', async () => {
    await expect(validateScholarshipDocumentUpload(new FormData())).rejects.toMatchObject({ code: 'INVALID_FILE' })
    const empty = new File([], 'documento.pdf', { type: 'application/pdf' })
    await expect(validateScholarshipDocumentUpload(formDataWith(empty))).rejects.toMatchObject({ code: 'INVALID_FILE' })
  })

  it('rejects a file larger than 8 MiB', async () => {
    const file = new File([new Uint8Array(MAX_SCHOLARSHIP_DOCUMENT_BYTES + 1)], 'documento.pdf', {
      type: 'application/pdf',
    })
    await expect(validateScholarshipDocumentUpload(formDataWith(file))).rejects.toMatchObject({
      code: 'INVALID_FILE',
      status: 413,
    })
  })
})

function formDataWith(file: File): FormData {
  const formData = new FormData()
  formData.set('file', file)
  return formData
}
