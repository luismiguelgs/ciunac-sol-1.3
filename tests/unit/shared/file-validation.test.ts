import { describe, expect, it } from 'vitest'
import { getFileViolation, type FilePolicy } from '@/modules/shared/domain/file-validation'
import { validateFileUpload } from '@/modules/shared/infrastructure/server/file-upload-validation'
import { validateVoucherFileMetadata } from '@/modules/shared/domain/voucher-file-policy'

const pdfPolicy: FilePolicy = { maxBytes: 8 * 1024 * 1024, allowedMimeTypes: ['application/pdf'] }
const metadata = { name: 'document.PDF', size: 5, mimeType: 'application/pdf' }

describe('shared technical file validation', () => {
  it('reads metadata from native File prototype properties in the browser adapter', () => {
    const file = new File(['%PDF-'], 'voucher.pdf', { type: 'application/pdf' })
    expect(validateVoucherFileMetadata(file)).toBeNull()
    expect(validateVoucherFileMetadata(new File([], 'empty.pdf', { type: 'application/pdf' })))
      .toBe('El archivo esta vacio.')
  })

  it('accepts uppercase extensions and the exact size limit', () => {
    expect(getFileViolation({ ...metadata, size: pdfPolicy.maxBytes }, pdfPolicy)).toBeNull()
  })

  it.each([
    [{ size: 0 }, 'EMPTY'],
    [{ size: Number.NaN }, 'EMPTY'],
    [{ size: pdfPolicy.maxBytes + 1 }, 'TOO_LARGE'],
    [{ mimeType: 'image/png', name: 'document.png' }, 'INVALID_MIME'],
    [{ name: 'document' }, 'INVALID_EXTENSION'],
    [{ name: 'document.pdf.exe' }, 'INVALID_EXTENSION'],
  ])('rejects metadata %j', (changes, violation) => {
    expect(getFileViolation({ ...metadata, ...changes }, pdfPolicy)).toBe(violation)
  })

  it('uses the supplied limit, not a feature-specific constant', () => {
    expect(getFileViolation(metadata, { ...pdfPolicy, maxBytes: 4 })).toBe('TOO_LARGE')
  })

  it('rejects a text field instead of a file', async () => {
    const formData = new FormData()
    formData.set('file', 'document.pdf')
    await expect(validateFileUpload(formData, pdfPolicy)).rejects.toMatchObject({ code: 'INVALID_FILE', status: 400 })
  })

  it('rejects a truncated signature', async () => {
    const formData = new FormData()
    formData.set('file', new File(['%PDF'], 'document.pdf', { type: 'application/pdf' }))
    await expect(validateFileUpload(formData, pdfPolicy)).rejects.toMatchObject({ code: 'INVALID_FILE', status: 400 })
  })
})
