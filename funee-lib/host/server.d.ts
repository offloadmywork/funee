/**
 * Host HTTP Server Module
 * 
 * Provides HTTP server functionality.
 * Import from "host://http/server"
 */

/**
 * Request handler function type
 */
export type RequestHandler = (request: Request) => Response | Promise<Response>;

/**
 * Options for serve()
 */
export interface ServeOptions {
  /** Port to listen on. Use 0 for random available port. */
  port: number;
  /** Hostname to bind to. Default: "127.0.0.1" */
  hostname?: string;
  /** Called when server starts listening */
  onListen?: (info: { port: number; hostname: string }) => void;
  /** Called when handler throws an error */
  onError?: (error: Error) => Response | Promise<Response>;
}

/**
 * Server handle returned by serve()
 */
export interface Server {
  /** Port the server is listening on */
  readonly port: number;
  /** Hostname the server is bound to */
  readonly hostname: string;
  /** Gracefully shutdown the server */
  shutdown(): Promise<void>;
  /** Async disposable - calls shutdown() when disposed */
  [Symbol.asyncDispose](): Promise<void>;
}

/**
 * Create an HTTP server
 * 
 * @param options - Server options including port and callbacks
 * @param handler - Request handler function
 * @returns Server handle with shutdown method
 * 
 * @example
 * ```typescript
 * import { serve } from "host://http/server";
 * 
 * const server = serve({ port: 3000 }, (req) => new Response("Hello, World!"));
 * await server.shutdown();
 * ```
 */
export declare function serve(options: ServeOptions, handler: RequestHandler): Server;

/**
 * Create a Response with optional body and init
 * 
 * @param body - Response body (string or null)
 * @param init - Optional ResponseInit configuration
 * @returns Response object
 */
export declare function createResponse(body?: string | null, init?: ResponseInit): Response;

/**
 * Create a JSON Response
 * 
 * @param data - Data to serialize as JSON
 * @param init - Optional ResponseInit configuration (Content-Type is set automatically)
 * @returns Response with JSON body and appropriate headers
 */
export declare function createJsonResponse(data: unknown, init?: ResponseInit): Response;
