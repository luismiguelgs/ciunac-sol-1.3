import { describe, expect, it } from 'vitest'
import { finInfoSchema } from '@/modules/shared/schemas/fin-data.schema'
import { finalSchema } from '@/modules/shared/schemas/final.schema'
import { verificationSchema } from '@/modules/shared/schemas/verification.schema'
import { paymentSchema } from '@/modules/shared/application/payment.schema'
import { sameMoney } from '@/modules/shared/domain/payment'
import { toPayment, toPaymentFormValues } from '@/modules/shared/components/payment-form.mapper'
import { toPaymentRequestFields } from '@/modules/shared/infrastructure/api/payment-fields'
import { certificateRequestDtoSchema } from '@/modules/solicitud-certificado/infrastructure/certificate-api.schemas'
import { constanciaRequestDtoSchema } from '@/modules/solicitud-constancia/infrastructure/constancia-api.schemas'
import { locationRequestDtoSchema } from '@/modules/solicitud-ubicacion/infrastructure/location-api.schemas'

describe('shared payment policy', () => {
  it('round trips a paid voucher without shifting its date or losing leading zeros', () => {
    const values = {
      pago: '30', numero_voucher: '000123456789012',
      fecha_pago: new Date('2026-09-25T05:00:00.000Z'), img_voucher: '/voucher.pdf',
    }
    const payment = toPayment(values)
    expect(paymentSchema.parse(payment)).toEqual(payment)
    expect(toPaymentFormValues(payment)).toEqual(values)
    expect(toPaymentRequestFields(payment)).toEqual({
      pago: 30, fechaPago: '2026-09-25T05:00:00.000Z',
      numeroVoucher: '000123456789012', imgVoucher: '/voucher.pdf',
    })
  })

  it('omits voucher fields on the wire for a free payment', () => {
    const payment = toPayment({ pago: '0' })
    expect(payment).toEqual({ amount: 0, voucher: null })
    expect(JSON.parse(JSON.stringify(toPaymentRequestFields(payment)))).toEqual({ pago: 0 })
    expect(toPaymentFormValues(null, 30).pago).toBe('30')
    expect(toPaymentFormValues(payment, 30).pago).toBe('0')
  })

  it.each(['', '-1', 'NaN', 'Infinity'])('rejects invalid amount %s', (pago) => {
    expect(() => toPayment({ pago })).toThrowError(expect.objectContaining({ code: 'VALIDATION' }))
  })

  it('normalizes an invalid date instead of throwing RangeError', () => {
    expect(() => toPayment({
      pago: '30', numero_voucher: '123456789012345',
      fecha_pago: new Date('invalid'), img_voucher: '/voucher.pdf',
    })).toThrowError(expect.objectContaining({ code: 'VALIDATION', status: 400 }))
  })

  it.each([
    { amount: -1, voucher: null },
    { amount: 30, voucher: null },
    { amount: 30, voucher: { number: '123', paidAt: '2026-09-25', url: '' } },
  ])('rejects invalid domain payment %j', (payment) => {
    expect(paymentSchema.safeParse(payment).success).toBe(false)
  })

  it('compares finite amounts in cents without deciding any feature price', () => {
    expect(sameMoney(0.1 + 0.2, 0.3)).toBe(true)
    expect(sameMoney(30, 80)).toBe(false)
    expect(sameMoney(Infinity, Infinity)).toBe(false)
  })

  it.each([
    [1, certificateRequestDtoSchema, true],
    [5, constanciaRequestDtoSchema, true],
    [7, locationRequestDtoSchema, false],
  ] as const)('keeps the backend payment contract for request type %s', (tipoSolicitudId, schema, digital) => {
    const base = { estudianteId: 'student-1', tipoSolicitudId, idiomaId: 2, nivelId: 1,
      estadoId: 1, periodo: '2026-2', alumnoCiunac: false, digital }
    expect(schema.safeParse({ ...base, pago: 30 }).success).toBe(false)
    expect(schema.safeParse({ ...base, pago: 0 }).success).toBe(true)
    const fields = toPaymentRequestFields(toPayment({ pago: '30', numero_voucher: '123456789012345',
      fecha_pago: new Date('2026-09-25'), img_voucher: '/voucher.pdf' }))
    expect(schema.safeParse({ ...base, ...fields }).success).toBe(true)
    expect(schema.safeParse({ ...base, ...fields, imgVoucher: 'javascript:invalid' }).success).toBe(false)
  })

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

  it('requires both final confirmations', () => {
    expect(finalSchema.safeParse({ info: false, terminos: true }).success).toBe(false)
    expect(finalSchema.safeParse({ info: true, terminos: false }).success).toBe(false)
    expect(finalSchema.safeParse({ info: true, terminos: true }).success).toBe(true)
  })

  it('validates a normalized email and a six-digit verification code', () => {
    expect(verificationSchema.safeParse({
      email: ' usuario@unac.edu.pe ',
      code: '123456',
    }).success).toBe(true)

    expect(verificationSchema.safeParse({
      email: 'correo-invalido',
      code: 'ABC123',
    }).success).toBe(false)
  })
})
