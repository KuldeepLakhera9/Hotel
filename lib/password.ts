import crypto from "crypto";
import bcrypt from "bcryptjs";
import type { IUser } from "./models/User";

// Matches passport-local-mongoose's defaults exactly (see
// node_modules/passport-local-mongoose/dist/lib/{pbkdf2,authenticate}.js):
// crypto.pbkdf2(password, saltHexString, 25000, 512, "sha256"). Note the
// salt is passed to pbkdf2 as its *hex string* verbatim, not decoded back
// to raw bytes — reproducing that quirk is required, not optional, or every
// legacy password check silently fails.
const LEGACY_ITERATIONS = 25000;
const LEGACY_KEYLEN = 512;
const LEGACY_DIGEST = "sha256";

function verifyLegacyPassword(password: string, saltHex: string, hashHex: string): boolean {
  const derived = crypto.pbkdf2Sync(password, saltHex, LEGACY_ITERATIONS, LEGACY_KEYLEN, LEGACY_DIGEST);
  const stored = Buffer.from(hashHex, "hex");
  if (derived.length !== stored.length) return false;
  return crypto.timingSafeEqual(derived, stored);
}

/**
 * Verifies a password against a user doc that may carry either the legacy
 * passport-local-mongoose PBKDF2 hash+salt (existing accounts) or a bcrypt
 * hash with no salt field (accounts created after this migration).
 */
export async function verifyPassword(
  password: string,
  user: Pick<IUser, "hash" | "salt">
): Promise<boolean> {
  if (!user.hash) return false;
  if (user.salt) {
    return verifyLegacyPassword(password, user.salt, user.hash);
  }
  return bcrypt.compare(password, user.hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
