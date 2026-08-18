'use client'

import React from 'react'

type OtpTiming = {
  expiresInSeconds: number
  resendInSeconds: number
}

type Deadlines = {
  expiresAt: number
  resendAt: number
}

export function useOtpTimers() {
  const [deadlines, setDeadlines] = React.useState<Deadlines | null>(null)
  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    if (!deadlines) return

    const intervalId = window.setInterval(() => {
      const currentTime = Date.now()
      setNow(currentTime)
      if (currentTime >= deadlines.expiresAt) window.clearInterval(intervalId)
    }, 1000)
    return () => window.clearInterval(intervalId)
  }, [deadlines])

  const start = (timing: OtpTiming) => {
    const startedAt = Date.now()
    setNow(startedAt)
    setDeadlines({
      expiresAt: startedAt + timing.expiresInSeconds * 1000,
      resendAt: startedAt + timing.resendInSeconds * 1000,
    })
  }

  const reset = () => {
    setDeadlines(null)
    setNow(Date.now())
  }

  const expirationSeconds = deadlines
    ? remainingSeconds(deadlines.expiresAt, now)
    : null
  const resendSeconds = deadlines
    ? remainingSeconds(deadlines.resendAt, now)
    : null

  return {
    expirationSeconds,
    resendSeconds,
    expired: expirationSeconds === 0,
    canResend: resendSeconds === 0,
    start,
    reset,
  }
}

export function formatOtpTime(seconds: number | null): string {
  const safeSeconds = Math.max(0, seconds ?? 0)
  const minutes = Math.floor(safeSeconds / 60)
  const remaining = safeSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`
}

function remainingSeconds(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000))
}
