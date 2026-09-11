import { createAuthClient } from "better-auth/react";

// In development, Vite proxies API requests through the web origin. This keeps
// Better Auth's session cookie first-party even when the API runs on another
// localhost host or port (for example, 127.0.0.1 vs localhost).
const API_BASE = import.meta.env.DEV
	? window.location.origin
	: (import.meta.env.VITE_API_URL ?? window.location.origin);

export const authClient = createAuthClient({
	baseURL: API_BASE,
	fetchOptions: { credentials: "include" },
});
