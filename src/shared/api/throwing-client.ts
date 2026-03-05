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
 */
type SuccessResponse<T> = T extends { data: infer D; response: infer R }
    ? { data: D; response: R }
    : never;

type ThrowingClientMethod<Original> = Original extends (
    url: infer U,
    ...init: infer I
) => Promise<infer R>
    ? (url: U, ...init: I) => Promise<SuccessResponse<R>>
    : never;

export type ThrowingClient<Paths extends {}, Media extends MediaType = MediaType> = Omit<
    Client<Paths, Media>,
    "GET" | "PUT" | "POST" | "DELETE" | "OPTIONS" | "HEAD" | "PATCH" | "TRACE"
> & {
    GET: ThrowingClientMethod<Client<Paths, Media>["GET"]>;
    PUT: ThrowingClientMethod<Client<Paths, Media>["PUT"]>;
    POST: ThrowingClientMethod<Client<Paths, Media>["POST"]>;
    DELETE: ThrowingClientMethod<Client<Paths, Media>["DELETE"]>;
    OPTIONS: ThrowingClientMethod<Client<Paths, Media>["OPTIONS"]>;
    HEAD: ThrowingClientMethod<Client<Paths, Media>["HEAD"]>;
    PATCH: ThrowingClientMethod<Client<Paths, Media>["PATCH"]>;
    TRACE: ThrowingClientMethod<Client<Paths, Media>["TRACE"]>;
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
