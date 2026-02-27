/**
 * Host Crypto Module
 * 
 * Provides cryptographic utilities.
 * Import from "host://crypto"
 */

/**
 * Generate cryptographically secure random bytes
 * 
 * @param length - Number of random bytes to generate
 * @returns Uint8Array of random bytes
 * 
 * @example
 * ```typescript
 * import { randomBytes } from "host://crypto";
 * 
 * const bytes = randomBytes(32);
 * const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
 * ```
 */
export declare function randomBytes(length: number): Uint8Array;
