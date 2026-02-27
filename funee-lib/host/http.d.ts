/**
 * Host HTTP Module
 * 
 * Provides web-standard fetch API.
 * Import from "host://http"
 */

/**
 * Fetch a resource from the network
 * 
 * This is the web-standard fetch() function.
 * 
 * @param input - URL string, URL object, or Request object
 * @param init - Optional request configuration
 * @returns Promise resolving to the Response
 * 
 * @example
 * ```typescript
 * import { fetch } from "host://http";
 * 
 * const response = await fetch("https://api.example.com/data");
 * const data = await response.json();
 * ```
 */
export declare function fetch(
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response>;
