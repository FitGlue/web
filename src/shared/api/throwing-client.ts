import type { Client, Middleware } from "openapi-fetch";
import type { MediaType } from "openapi-typescript-helpers";
import { Sentry } from "../../app/infrastructure/sentry";

/**
 * A version of the openapi-fetch Client where errors are thrown
 * instead of returned. This means:
 * - `const { data } = await client.GET(...)` works in a try/catch
 * - `const { error } = ...` is a TypeScript error (error is never returned)
 *
 * All non-2xx responses throw before returning, courtesy of the
 * onResponse middleware below.
 * 
 * We strip `error` from the return type via Omit on the awaited result.
 * The method signatures are preserved exactly as openapi-fetch provides them.
 */

/**
 * Helper: given the original Client type, produce a new type where
 * every HTTP method's Promise resolves to Omit<R, 'error'> instead of R.
 *
 * We use a mapped type over keyof Client, and for the known HTTP methods
 * we wrap their return types. Everything else (use, eject, etc) passes through.
 */
type StripError<T> = T extends (...args: infer A) => Promise<infer R>
    ? (...args: A) => Promise<Omit<R, 'error'>>
    : T;

// eslint-disable-next-line @typescript-eslint/ban-types
export type ThrowingClient<Paths extends {}, Media extends MediaType = MediaType> = {
    [K in keyof Client<Paths, Media>]: StripError<Client<Paths, Media>[K]>;
};

/**
 * Middleware that throws on non-2xx responses (after capturing to Sentry).
 * Because it throws, the `error` branch of openapi-fetch's FetchResponse
 * is never reached, matching the ThrowingClient type above.
 */
export function createErrorMiddleware(label: string): Middleware {
    return {
        async onResponse({ response, request }) {
            if (!response.ok) {
                const err = new Error(
                    `${label} ${request.method} ${new URL(response.url).pathname} failed: ${response.status} ${response.statusText}`
                );
                Sentry.captureException(err, {
                    tags: {
                        api_method: request.method,
                        api_path: new URL(response.url).pathname,
                        status_code: response.status,
                    },
                    extra: { statusText: response.statusText },
                });
                throw err;
            }
            return response;
        },
    };
}
