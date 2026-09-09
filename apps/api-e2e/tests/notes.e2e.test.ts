import { beforeAll, describe, expect, it } from "vitest";
import { BASE_URL } from "../support/client.ts";

let cookie = "";

beforeAll(async () => {
	const signInResponse = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			email: "admin@app.test",
			password: "admin-password-123",
		}),
	});
	cookie = signInResponse.headers.get("set-cookie") ?? "";
});

describe("notes REST endpoints", () => {
	it("creates and lists a note over /api as the seeded admin", async () => {
		const createResponse = await fetch(`${BASE_URL}/api/notes`, {
			method: "POST",
			headers: { "Content-Type": "application/json", cookie },
			body: JSON.stringify({ title: "From e2e", body: "hello" }),
		});
		expect(createResponse.status).toBe(200);

		const listResponse = await fetch(
			`${BASE_URL}/api/notes?page=1&pageSize=20`,
			{
				headers: { cookie },
			},
		);
		const list = (await listResponse.json()) as { items: { title: string }[] };
		expect(
			list.items.some((item: { title: string }) => item.title === "From e2e"),
		).toBe(true);
	});
});
