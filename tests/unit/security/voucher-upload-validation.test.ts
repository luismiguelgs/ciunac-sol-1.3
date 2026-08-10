import { describe, expect, it } from 'vitest'
import { MAX_VOUCHER_FILE_BYTES } from '@/modules/shared/domain/voucher-file-policy'
import { validateVoucherUpload } from '@/modules/security/server/voucher-upload-validation'

describe('voucher upload validation', () => {
  it.each([
    ['voucher.pdf', 'application/pdf', [0x25, 0x50, 0x44, 0x46, 0x2d]],
    ['voucher.png', 'image/png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    ['voucher.jpg', 'image/jpeg', [0xff, 0xd8, 0xff, 0xe0]],
    ['voucher.jpeg', 'image/jpeg', [0xff, 0xd8, 0xff, 0xe1]],
  ])('accepts a real %s signature', async (name, type, bytes) => {
    const file = new File([new Uint8Array(bytes)], name, { type })
    await expect(validateVoucherUpload(formDataWith(file))).resolves.toBe(file)
  })

  it.each([
    ['voucher.png', 'image/png', [0x25, 0x50, 0x44, 0x46, 0x2d]],
    ['voucher.pdf', 'application/pdf', [0x89, 0x50, 0x4e, 0x47]],
    ['voucher.jpg', 'image/jpeg', [0x00, 0x00, 0x00]],
  ])('rejects a forged %s signature', async (name, type, bytes) => {
    const file = new File([new Uint8Array(bytes)], name, { type })
    await expect(validateVoucherUpload(formDataWith(file))).rejects.toMatchObject({ code: 'INVALID_FILE' })
  })

  it('rejects an extension that does not match the MIME type', async () => {
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], 'voucher.pdf', {
      type: 'image/png',
    })
    await expect(validateVoucherUpload(formDataWith(file))).rejects.toMatchObject({ code: 'INVALID_FILE' })
  })

  it('rejects a missing or empty file', async () => {
    await expect(validateVoucherUpload(new FormData())).rejects.toMatchObject({ code: 'INVALID_FILE' })
    const empty = new File([], 'voucher.pdf', { type: 'application/pdf' })
    await expect(validateVoucherUpload(formDataWith(empty))).rejects.toMatchObject({ code: 'INVALID_FILE' })
  })

  it('rejects a file larger than 8 MiB', async () => {
    const file = new File(
      [new Uint8Array(MAX_VOUCHER_FILE_BYTES + 1)],
      'voucher.pdf',
      { type: 'application/pdf' },
    )
    await expect(validateVoucherUpload(formDataWith(file))).rejects.toMatchObject({
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
