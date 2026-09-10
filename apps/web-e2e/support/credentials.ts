import type { TLoginInput } from "@app/schemas";

export const SEED_CREDENTIALS = {
	admin: { email: "admin@app.test", password: "admin-password-123" },
	member: { email: "member@app.test", password: "member-password-123" },
	viewer: { email: "viewer@app.test", password: "viewer-password-123" },
} as const satisfies Record<string, TLoginInput>;
