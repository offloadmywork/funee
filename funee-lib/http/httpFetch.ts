/**
 * httpFetch - Low-level HTTP response types
 *
 * For most use cases, prefer the higher-level httpRequest, httpGetJSON,
 * or httpPostJSON functions, or use the standard fetch API from "host://http".
 */

/**
 * Parsed HTTP response from httpRequest.
 */
export interface HttpResponse {
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers: Record<string, string>;
  /** Response body as string */
  body: string;
}

/**
 * Parse a JSON string to HttpResponse.
 * 
 * @deprecated This is for backwards compatibility. Use fetch from "host://http" instead.
 *
 * @param jsonResponse - The JSON string to parse
 * @returns Parsed HttpResponse object
 */
export const parseHttpResponse = (json: string): HttpResponse => {
  return JSON.parse(json) as HttpResponse;
};
