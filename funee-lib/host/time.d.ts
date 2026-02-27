/**
 * Host Time Module
 * 
 * Provides timer functions.
 * Import from "host://time"
 */

/**
 * Schedule a callback to run after a delay
 * 
 * @param callback - Function to call after delay
 * @param ms - Delay in milliseconds
 * @returns Timer ID that can be passed to clearTimeout
 */
export declare function setTimeout(callback: () => void, ms: number): number;

/**
 * Cancel a timeout scheduled with setTimeout
 * 
 * @param id - Timer ID returned by setTimeout
 */
export declare function clearTimeout(id: number): void;

/**
 * Schedule a callback to run repeatedly at an interval
 * 
 * @param callback - Function to call at each interval
 * @param ms - Interval in milliseconds
 * @returns Timer ID that can be passed to clearInterval
 */
export declare function setInterval(callback: () => void, ms: number): number;

/**
 * Cancel an interval scheduled with setInterval
 * 
 * @param id - Timer ID returned by setInterval
 */
export declare function clearInterval(id: number): void;
