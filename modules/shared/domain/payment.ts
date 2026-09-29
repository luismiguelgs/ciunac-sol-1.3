export type PaymentVoucher = { number: string; paidAt: string; url: string }
export type Payment =
  | { amount: 0; voucher: null }
  | { amount: number; voucher: PaymentVoucher }

export function sameMoney(left: number, right: number): boolean {
  return Number.isFinite(left) && Number.isFinite(right) && Math.round(left * 100) === Math.round(right * 100)
}
