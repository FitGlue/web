import createClient from "openapi-fetch";
import type { paths } from "./schema-client";
import { getFirebaseAuth } from "../firebase";
import { Sentry } from "../../app/infrastructure/sentry";

// Authenticated client for api-client gateway (/api/v2/*)
const BASE_URL = "/api/v2";

export const client = createClient<paths>({
  baseUrl: BASE_URL,
});

// Auth middleware — attaches Firebase ID token to every request
client.use({
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
        new Error(`API ${response.url} failed: ${response.status} ${response.statusText}`),
        {
          tags: { api_status: response.status },
        }
      );
    }
    return response;
  },
});

export default client;
