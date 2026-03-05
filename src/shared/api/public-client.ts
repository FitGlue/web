import createClient from "openapi-fetch";
import type { paths } from "./schema-public";
import type { ThrowingClient } from "./throwing-client";
import { createErrorMiddleware } from "./throwing-client";

// Unauthenticated client for api-public gateway (/api/public/*)
const BASE_URL = "/api/public";

const rawClient = createClient<paths>({
    baseUrl: BASE_URL,
});

// Error middleware — throws on non-2xx (after Sentry capture)
rawClient.use(createErrorMiddleware("Public API"));

// Export as ThrowingClient so callers can't destructure { error }
export const publicClient = rawClient as unknown as ThrowingClient<paths>;
export default publicClient;
