import createClient from "openapi-fetch";
import type { paths } from "./schema-client";
import { getFirebaseAuth } from "../firebase";
import type { ThrowingClient } from "./throwing-client";
import { createErrorMiddleware } from "./throwing-client";

// Authenticated client for api-client gateway (/api/v2/*)
const BASE_URL = "/api/v2";

const rawClient = createClient<paths>({
  baseUrl: BASE_URL,
});

// Auth middleware — attaches Firebase ID token to every request
rawClient.use({
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
});

// Error middleware — throws on non-2xx (after Sentry capture)
rawClient.use(createErrorMiddleware("API"));

// Export as ThrowingClient so callers can't destructure { error }
export const client = rawClient as unknown as ThrowingClient<paths>;
export default client;
