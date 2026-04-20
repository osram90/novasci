import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const SCRYPT_KEY_LEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, SCRYPT_KEY_LEN).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, encoded: string): boolean {
  const [salt, savedHash] = encoded.split(':');
  if (!salt || !savedHash) return false;

  const passwordHash = scryptSync(password, salt, SCRYPT_KEY_LEN);
  const savedHashBuffer = Buffer.from(savedHash, 'hex');

  if (savedHashBuffer.length !== passwordHash.length) return false;
  return timingSafeEqual(savedHashBuffer, passwordHash);
}
