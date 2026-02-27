/**
 * Web Fetch API - Type definitions and re-exports
 *
 * The actual fetch(), Headers, and Response are globals provided by the runtime.
 * This module provides TypeScript type definitions for type safety.
 *
 * @example
 * ```typescript
 * // fetch is already a global - no import needed
 * const response = await fetch("https://api.example.com/data");
 * const data = await response.json();
 *
 * // Or import types for type annotations
 * import type { HeadersInit, RequestInit, ResponseInit } from "funee";
 * ```
 */

// ============================================================================
// Headers types
// ============================================================================

/**
 * Valid inputs for Headers constructor
 */
export type HeadersInit =
  | Headers
  | Record<string, string>
  | [string, string][];

/**
 * Headers interface matching the WHATWG Fetch Standard
 */
export interface Headers {
  get(name: string): string | null;
  set(name: string, value: string): void;
  has(name: string): boolean;
  delete(name: string): void;
  append(name: string, value: string): void;
  entries(): IterableIterator<[string, string]>;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
  forEach(callback: (value: string, key: string, parent: Headers) => void): void;
  [Symbol.iterator](): IterableIterator<[string, string]>;
}

/**
 * Headers constructor type
 */
export interface HeadersConstructor {
  new (init?: HeadersInit): Headers;
  prototype: Headers;
}

// ============================================================================
// Response types
// ============================================================================

/**
 * Options for Response constructor
 */
export interface ResponseInit {
  status?: number;
  statusText?: string;
  headers?: HeadersInit;
}

/**
 * Response type (basic, cors, error, opaque, opaqueredirect)
 */
export type ResponseType = "basic" | "cors" | "error" | "opaque" | "opaqueredirect";

/**
 * Response interface matching the WHATWG Fetch Standard
 */
export interface Response {
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly headers: Headers;
  readonly url: string;
  readonly redirected: boolean;
  readonly type: ResponseType;
  readonly bodyUsed: boolean;

  json(): Promise<unknown>;
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
  bytes(): Promise<Uint8Array>;
  blob(): Promise<Blob>;
  clone(): Response;
}

/**
 * Response constructor type with static methods
 */
export interface ResponseConstructor {
  new (body?: BodyInit | null, init?: ResponseInit): Response;
  prototype: Response;
  error(): Response;
  redirect(url: string, status?: number): Response;
  json(data: unknown, init?: ResponseInit): Response;
}

// ============================================================================
// Request types
// ============================================================================

/**
 * How to handle redirects
 */
export type RequestRedirect = "follow" | "error" | "manual";

/**
 * Options for fetch() second parameter
 */
export interface RequestInit {
  method?: string;
  headers?: HeadersInit;
  body?: string | null;
  redirect?: RequestRedirect;
  signal?: AbortSignal | null;
}

// ============================================================================
// Body types
// ============================================================================

/**
 * Valid body types for Request/Response constructors
 */
export type BodyInit = string | ArrayBuffer | Uint8Array | null;

// ============================================================================
// Blob type (simplified)
// ============================================================================

/**
 * Simplified Blob interface
 */
export interface Blob {
  readonly size: number;
  readonly type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
}

// ============================================================================
// Global declarations
// ============================================================================

// Re-declare globals for TypeScript (these are provided by the runtime)
declare global {
  const Headers: HeadersConstructor;
  const Response: ResponseConstructor;
  function fetch(input: string | URL | Request, init?: RequestInit): Promise<Response>;
}

// Import fetch from host://http for explicit imports
import { fetch as hostFetch } from "host://http";
export const fetch = hostFetch;

// ============================================================================
// Factory function aliases (for funee-style API)
// ============================================================================

/**
 * Create a new Headers object
 * Alias for `new Headers(init)` for funee-style usage
 */
export const createHeaders = (init?: HeadersInit): Headers => {
  return new globalThis.Headers(init);
};

/**
 * Check if value is a Headers object
 */
export const isHeaders = (value: unknown): value is Headers => {
  return value instanceof globalThis.Headers ||
    (typeof value === 'object' && 
     value !== null && 
     typeof (value as Headers).get === 'function' &&
     typeof (value as Headers).set === 'function' &&
     typeof (value as Headers).has === 'function');
};

/**
 * Create a new Response object
 * Alias for `new Response(body, init)` for funee-style usage
 */
export const createResponse = (body?: BodyInit | null, init?: ResponseInit): Response => {
  return new globalThis.Response(body, init);
};

/**
 * Create an error Response
 * Alias for `Response.error()` for funee-style usage
 */
export const createErrorResponse = (): Response => {
  return globalThis.Response.error();
};

/**
 * Create a redirect Response
 * Alias for `Response.redirect(url, status)` for funee-style usage
 */
export const createRedirectResponse = (url: string, status?: number): Response => {
  return globalThis.Response.redirect(url, status);
};

/**
 * Create a JSON Response
 * Alias for `Response.json(data, init)` for funee-style usage
 */
export const createJsonResponse = (data: unknown, init?: ResponseInit): Response => {
  return globalThis.Response.json(data, init);
};
