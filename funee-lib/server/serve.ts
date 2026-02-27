/**
 * HTTP Server - serve() function types
 * 
 * The actual implementation is in the runtime bootstrap (run_js.rs).
 * This file exports types for TypeScript users.
 * 
 * @example
 * ```typescript
 * import { serve } from "funee";
 * 
 * // Simple server
 * const server = serve({ port: 3000 }, (req) => {
 *   return new Response("Hello, World!");
 * });
 * 
 * // Shutdown when done
 * await server.shutdown();
 * ```
 */

import { serve as hostServe } from "host://http/server";

/**
 * Request handler function
 */
export type RequestHandler = (request: Request) => Response | Promise<Response>;

/**
 * Options for serve()
 */
export type ServeOptions = {
  /** Port to listen on. Use 0 for random available port. */
  port: number;
  /** Hostname to bind to. Default: "127.0.0.1" */
  hostname?: string;
  /** Called when server starts listening */
  onListen?: (info: { port: number; hostname: string }) => void;
  /** Called when handler throws an error */
  onError?: (error: Error) => Response | Promise<Response>;
};

/**
 * Server handle returned by serve()
 */
export type Server = {
  /** Port the server is listening on */
  readonly port: number;
  /** Hostname the server is bound to */
  readonly hostname: string;
  /** Gracefully shutdown the server */
  shutdown: () => Promise<void>;
  /** Async disposable - calls shutdown() when disposed */
  [Symbol.asyncDispose]: () => Promise<void>;
};

/**
 * Create an HTTP server
 * 
 * @param options - Server options including port and callbacks
 * @param handler - Request handler function
 * @returns Server handle with shutdown method
 * 
 * @example
 * ```typescript
 * const server = serve({ port: 3000 }, (req) => {
 *   const url = new URL(req.url);
 *   if (url.pathname === "/api") {
 *     return Response.json({ hello: "world" });
 *   }
 *   return new Response("Not Found", { status: 404 });
 * });
 * ```
 */
export const serve = hostServe as (
  options: ServeOptions,
  handler: RequestHandler,
) => Server;
