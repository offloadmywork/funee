import { randomBytes } from "host://crypto";

/**
 * Generate a cryptographically secure random string of the specified length.
 * 
 * Uses the funee runtime's randomBytes host function which provides
 * cryptographically secure random bytes.
 * 
 * @param desiredLength - The desired length of the random string
 * @returns A random hexadecimal string of the specified length
 * 
 * @example
 * ```ts
 * import { cryptoRandomString } from "funee";
 * 
 * const id = cryptoRandomString(16);
 * // => "a1b2c3d4e5f6a7b8"
 * ```
 */
export const cryptoRandomString = (desiredLength: number): string => {
  // randomBytes returns Uint8Array, convert to hex string
  const bytesNeeded = Math.ceil(desiredLength / 2);
  const bytes = randomBytes(bytesNeeded);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return hex.slice(0, desiredLength);
};
