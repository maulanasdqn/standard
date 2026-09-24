import { A } from "@mobily/ts-belt";
import { beforeAll, describe, expect, it } from "vitest";
import { BASE_URL } from "../support/client.ts";

let cookie = "";

beforeAll(async (): Promise<void> => {
	const signInResponse = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			email: "admin@test.app",
			password: "Password123",
		}),
	});
	cookie = signInResponse.headers.get("set-cookie") ?? "";
});

describe("notes REST endpoints", () => {
	it("creates and lists a note over /api as the seeded admin", async (): Promise<void> => {
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
		expect(A.some(list.items, (item) => item.title === "From e2e")).toBe(true);
	});

	it("lets only one of two concurrent updates win and rejects the stale one", async (): Promise<void> => {
		const createResponse = await fetch(`${BASE_URL}/api/notes`, {
			method: "POST",
			headers: { "Content-Type": "application/json", cookie },
			body: JSON.stringify({ title: "Contended", body: "start" }),
		});
		const created = (await createResponse.json()) as {
			id: string;
			version: number;
		};

		const updateWith = (title: string): Promise<Response> =>
			fetch(`${BASE_URL}/api/notes/${created.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json", cookie },
				body: JSON.stringify({
					id: created.id,
					title,
					version: created.version,
				}),
			});

		const [first, second] = await Promise.all([
			updateWith("Writer one"),
			updateWith("Writer two"),
		]);

		const statuses = A.sort([first.status, second.status], (a, b) => a - b);
		expect(statuses).toStrictEqual([200, 409]);

		const afterResponse = await fetch(`${BASE_URL}/api/notes/${created.id}`, {
			headers: { cookie },
		});
		const after = (await afterResponse.json()) as {
			title: string;
			version: number;
		};
		expect(after.version).toBe(created.version + 1);
		expect(["Writer one", "Writer two"]).toContain(after.title);
	});

	it("rejects an update that carries a version the note has moved past", async (): Promise<void> => {
		const createResponse = await fetch(`${BASE_URL}/api/notes`, {
			method: "POST",
			headers: { "Content-Type": "application/json", cookie },
			body: JSON.stringify({ title: "Stale", body: "start" }),
		});
		const created = (await createResponse.json()) as {
			id: string;
			version: number;
		};

		const firstResponse = await fetch(`${BASE_URL}/api/notes/${created.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", cookie },
			body: JSON.stringify({
				id: created.id,
				title: "Applied",
				version: created.version,
			}),
		});
		expect(firstResponse.status).toBe(200);

		const staleResponse = await fetch(`${BASE_URL}/api/notes/${created.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", cookie },
			body: JSON.stringify({
				id: created.id,
				title: "Overwrites",
				version: created.version,
			}),
		});
		expect(staleResponse.status).toBe(409);
	});

	it("treats a wildcard in the search text as a literal character", async (): Promise<void> => {
		const createWith = (title: string): Promise<Response> =>
			fetch(`${BASE_URL}/api/notes`, {
				method: "POST",
				headers: { "Content-Type": "application/json", cookie },
				body: JSON.stringify({ title, body: "search" }),
			});
		await createWith("Discount 50%");
		await createWith("Discount 500");

		const searchResponse = await fetch(
			`${BASE_URL}/api/notes?page=1&pageSize=20&search=${encodeURIComponent("50%")}`,
			{ headers: { cookie } },
		);
		const found = (await searchResponse.json()) as {
			items: { title: string }[];
		};
		const titles = A.map(found.items, (item) => item.title);

		expect(titles).toContain("Discount 50%");
		expect(titles).not.toContain("Discount 500");
	});
});
