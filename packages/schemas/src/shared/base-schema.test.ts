import { z } from "zod";
import { describe, expect, it } from "vitest";
import { baseSchema } from "./base-schema.ts";

describe("baseSchema", () => {
	it("validates the shared entity fields with a caller-provided ID schema", () => {
		const schema = baseSchema(z.string());

		expect(
			schema.safeParse({
				id: "entity-1",
				createdAt: "2027-01-01T00:00:00Z",
				updatedAt: "2027-01-01T00:00:00Z",
			}),
		).toMatchObject({ success: true });
	});
});
