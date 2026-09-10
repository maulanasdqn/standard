import type { TLoginInput } from "@app/schemas";
import { BASE_URL } from "./client.ts";

export const SEED_CREDENTIALS = {
	admin: { email: "admin@app.test", password: "admin-password-123" },
	member: { email: "member@app.test", password: "member-password-123" },
	viewer: { email: "viewer@app.test", password: "viewer-password-123" },
} as const satisfies Record<string, TLoginInput>;

export const signIn = async ({
	email,
	password,
}: TLoginInput): Promise<string> => {
	const response = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});
	return response.headers.get("set-cookie") ?? "";
};
