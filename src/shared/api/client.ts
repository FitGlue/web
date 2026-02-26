import createClient from "openapi-fetch";
import type { paths } from "./schema";

// For Firebase Hosting, we use a relative path so rewrites work correctly
const BASE_URL = "/api/v2";

export const client = createClient<paths>({
  baseUrl: BASE_URL,
});

export default client;
