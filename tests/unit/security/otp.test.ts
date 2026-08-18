import { describe, expect, it } from 'vitest'
import {
  createOtpChallenge,
  generateOtpCode,
  OTP_EXPIRATION_MS,
  OTP_RESEND_DELAY_MS,
  verifyOtpCode,
} from '@/modules/security/server/otp'
import { SecurityError } from '@/modules/security/server/security-error'

const secret = 'test-secret-with-at-least-thirty-two-bytes'
const email = 'security@example.com'
const purpose = 'CERTIFICADO' as const

function challengeAt(now = 1_000) {
  return createOtpChallenge({
    email,
    purpose,
    secret,
    now,
    generateCode: () => '123456',
  }).challenge
}

describe('OTP security policy', () => {
  it('generates exactly six visible digits without a leading zero', () => {
    for (let sample = 0; sample < 100; sample += 1) {
      expect(generateOtpCode()).toMatch(/^[1-9]\d{5}$/)
    }
  })

  it('rejects an injected code with a leading zero', () => {
    expect(() => createOtpChallenge({
      email,
      purpose,
      secret,
      generateCode: () => '012345',
    })).toThrowError(/without a leading zero/)
  })

  it('rejects an expired OTP', () => {
    const challenge = challengeAt()
    const result = verifyOtpCode(challenge, '123456', secret, 1_000 + OTP_EXPIRATION_MS + 1)

    expect(result).toMatchObject({ ok: false, code: 'OTP_EXPIRED' })
  })

  it('keeps the OTP valid through the five-minute boundary', () => {
    const result = verifyOtpCode(challengeAt(), '123456', secret, 1_000 + OTP_EXPIRATION_MS)

    expect(result.ok).toBe(true)
  })

  it('rejects an incorrect OTP and decrements attempts', () => {
    const result = verifyOtpCode(challengeAt(), '654321', secret, 2_000)

    expect(result).toMatchObject({
      ok: false,
      code: 'VERIFICATION_FAILED',
      challenge: { attemptsRemaining: 4 },
    })
  })

  it('blocks the challenge after the maximum number of attempts', () => {
    let challenge = challengeAt()
    let result = verifyOtpCode(challenge, '000000', secret, 2_000)

    for (let attempt = 1; attempt < 5; attempt += 1) {
      challenge = result.challenge
      result = verifyOtpCode(challenge, '000000', secret, 2_000 + attempt)
    }

    expect(result).toMatchObject({ ok: false, code: 'MAX_ATTEMPTS' })
    expect(result.challenge.attemptsRemaining).toBe(0)
  })

  it('marks a successful OTP as consumed and rejects reuse', () => {
    const firstResult = verifyOtpCode(challengeAt(), '123456', secret, 2_000)
    expect(firstResult.ok).toBe(true)

    const secondResult = verifyOtpCode(firstResult.challenge, '123456', secret, 2_001)
    expect(secondResult).toMatchObject({ ok: false, code: 'OTP_REUSED' })
  })

  it('rejects a resend before three minutes', () => {
    const previous = challengeAt()

    expect(() => createOtpChallenge({
      email,
      purpose,
      secret,
      previous,
      now: 1_000 + OTP_RESEND_DELAY_MS - 1,
      generateCode: () => '654321',
    })).toThrowError(expect.objectContaining<Partial<SecurityError>>({ code: 'RESEND_TOO_SOON' }))
  })

  it('allows a resend after the three-minute delay', () => {
    const previous = challengeAt()

    expect(() => createOtpChallenge({
      email,
      purpose,
      secret,
      previous,
      now: 1_000 + OTP_RESEND_DELAY_MS,
      generateCode: () => '654321',
    })).not.toThrow()
  })

  it('limits sends to five in a 15-minute window', () => {
    let previous = challengeAt()

    for (let send = 1; send < 5; send += 1) {
      previous = createOtpChallenge({
        email,
        purpose,
        secret,
        previous,
        now: 1_000 + send * OTP_RESEND_DELAY_MS,
        generateCode: () => '654321',
      }).challenge
    }

    expect(() => createOtpChallenge({
      email,
      purpose,
      secret,
      previous,
      now: 1_000 + 5 * OTP_RESEND_DELAY_MS,
      generateCode: () => '654321',
    })).toThrowError(expect.objectContaining<Partial<SecurityError>>({ code: 'RATE_LIMITED' }))
  })
})
