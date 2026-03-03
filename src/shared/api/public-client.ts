import createClient from "openapi-fetch";
import type { paths } from "./schema-public";

// Unauthenticated client for api-public gateway (/api/public/*)
const BASE_URL = "/api/public";

export const publicClient = createClient<paths>({
    baseUrl: BASE_URL,
});

export default publicClient;
