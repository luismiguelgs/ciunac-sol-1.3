import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const TOKEN_VERSION = 'v1';
const AUTH_TAG_BYTES = 16;

function deriveKey(secret: string): Buffer {
  return createHash('sha256').update(secret, 'utf8').digest();
}

export function encryptToken(payload: object, secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, deriveKey(secret), iv, { authTagLength: AUTH_TAG_BYTES });
  cipher.setAAD(Buffer.from(TOKEN_VERSION));

  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
  ]);

  return [
    TOKEN_VERSION,
    iv.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.');
}

export function decryptToken<T>(token: string | undefined, secret: string): T | null {
  if (!token) return null;

  try {
    const [version, ivValue, tagValue, ciphertextValue] = token.split('.');
    if (version !== TOKEN_VERSION || !ivValue || !tagValue || !ciphertextValue) return null;

    const decipher = createDecipheriv(
      ALGORITHM,
      deriveKey(secret),
      Buffer.from(ivValue, 'base64url'),
      { authTagLength: AUTH_TAG_BYTES },
    );
    decipher.setAAD(Buffer.from(TOKEN_VERSION));
    decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));

    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, 'base64url')),
      decipher.final(),
    ]).toString('utf8');

    return JSON.parse(plaintext) as T;
  } catch {
    return null;
  }
}
