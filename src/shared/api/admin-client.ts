import createClient from "openapi-fetch";
import type { paths } from "./schema-admin";
import { getFirebaseAuth } from "../firebase";
import { Sentry } from "../../app/infrastructure/sentry";

// Authenticated client for api-admin gateway (/api/admin/*)
const BASE_URL = "/api/admin";

export const adminClient = createClient<paths>({
    baseUrl: BASE_URL,
});

// Auth middleware — attaches Firebase ID token to every request
adminClient.use({
    async onRequest({ request }) {
        const auth = getFirebaseAuth();
        if (auth?.currentUser) {
            try {
                const token = await auth.currentUser.getIdToken();
                if (token) request.headers.set("Authorization", `Bearer ${token}`);
            } catch (err) {
                console.error("Failed to get auth token:", err);
            }
        }
        return request;
    },
    async onResponse({ response }) {
        if (!response.ok && response.status >= 500) {
            Sentry.captureException(
                new Error(`Admin API ${response.url} failed: ${response.status} ${response.statusText}`),
                {
                    tags: { api_status: response.status },
                }
            );
        }
        return response;
    },
});

export default adminClient;
