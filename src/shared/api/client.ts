import createClient from "openapi-fetch";
import type { paths } from "./schema";

// This should be configurable via env or detect from window.location
const BASE_URL = window.location.origin.includes("localhost")
  ? "http://localhost:8080"
  : "https://api.fitglue.app";

export const client = createClient<paths>({
  baseUrl: BASE_URL,
});

export default client;
