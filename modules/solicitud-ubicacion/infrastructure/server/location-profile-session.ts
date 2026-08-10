import 'server-only'

import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getOtpSessionSecret } from '@/modules/security/server/environment'
import { decryptToken, encryptToken } from '@/modules/security/server/token-crypto'

const LOCATION_PROFILE_COOKIE = 'ciunac_location_profile'
const LOCATION_PROFILE_MS = 15 * 60 * 1000

export type LocationProfile = {
  kind: 'location-profile'
  isCiunacStudent: boolean
  expiresAt: number
}

function options(maxAgeMs: number) {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(maxAgeMs / 1000),
  }
}

function decode(value: string | undefined): LocationProfile | null {
  const profile = decryptToken<LocationProfile>(value, getOtpSessionSecret())
  if (!profile || profile.kind !== 'location-profile' || profile.expiresAt <= Date.now()) return null
  return profile
}

export function writeLocationProfile(response: NextResponse, isCiunacStudent: boolean): void {
  const profile: LocationProfile = {
    kind: 'location-profile',
    isCiunacStudent,
    expiresAt: Date.now() + LOCATION_PROFILE_MS,
  }
  response.cookies.set(
    LOCATION_PROFILE_COOKIE,
    encryptToken(profile, getOtpSessionSecret()),
    options(LOCATION_PROFILE_MS),
  )
}

export function readLocationProfileFromRequest(request: NextRequest): LocationProfile | null {
  return decode(request.cookies.get(LOCATION_PROFILE_COOKIE)?.value)
}

export async function readLocationProfile(): Promise<LocationProfile | null> {
  const cookieStore = await cookies()
  return decode(cookieStore.get(LOCATION_PROFILE_COOKIE)?.value)
}

