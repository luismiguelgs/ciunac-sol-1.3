import { describe, expect, it } from 'vitest'
import { finInfoSchema } from '@/modules/shared/schemas/fin-data.schema'

describe('shared payment policy', () => {
  it('allows a zero amount without voucher data', () => {
    expect(finInfoSchema.safeParse({
      pago: '0',
      numero_voucher: '',
      fecha_pago: null,
      img_voucher: '',
    }).success).toBe(true)
  })

  it('requires number, date and uploaded file when amount is positive', () => {
    const result = finInfoSchema.safeParse({
      pago: '30',
      numero_voucher: '',
      fecha_pago: null,
      img_voucher: '',
    })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining(['numero_voucher', 'fecha_pago', 'img_voucher']),
    )
  })

  it('requires exactly 15 voucher digits for a positive amount', () => {
    expect(finInfoSchema.safeParse({
      pago: '30',
      numero_voucher: '123456789012345',
      fecha_pago: new Date('2026-08-01'),
      img_voucher: '/vouchers/fixture.png',
    }).success).toBe(true)

    expect(finInfoSchema.safeParse({
      pago: '30',
      numero_voucher: '123',
      fecha_pago: new Date('2026-08-01'),
      img_voucher: '/vouchers/fixture.png',
    }).success).toBe(false)
  })
})
