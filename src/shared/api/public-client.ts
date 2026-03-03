import createClient from "openapi-fetch";
import type { paths } from "./schema-public";
import { Sentry } from "../../app/infrastructure/sentry";

// Unauthenticated client for api-public gateway (/api/public/*)
const BASE_URL = "/api/public";

export const publicClient = createClient<paths>({
    baseUrl: BASE_URL,
});

publicClient.use({
    async onResponse({ response, request }) {
        if (!response.ok) {
            Sentry.captureException(
                new Error(`Public API ${request.method} ${new URL(response.url).pathname} failed: ${response.status} ${response.statusText}`),
                {
                    tags: {
                        api_method: request.method,
                        api_path: new URL(response.url).pathname,
                        status_code: response.status,
                    },
                    extra: { statusText: response.statusText },
                }
            );
        }
        return response;
    },
});

export default publicClient;
