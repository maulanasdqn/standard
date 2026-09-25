import { describe, expect, it } from "vitest";
import { isUniqueViolation } from "#/platform/db/unique-violation.ts";

const UNIQUE_VIOLATION = Object.assign(
	new Error(
		'duplicate key value violates unique constraint "user_email_unique"',
	),
	{ code: "23505", constraint: "user_email_unique" },
);

const FOREIGN_KEY_VIOLATION = Object.assign(
	new Error("insert or update violates foreign key constraint"),
	{ code: "23503" },
);

describe("isUniqueViolation", () => {
	it("recognises the driver error itself", (): void => {
		expect(isUniqueViolation(UNIQUE_VIOLATION)).toBe(true);
	});

	it("looks through the query wrapper the ORM adds", (): void => {
		const wrapped = new Error("Failed query", { cause: UNIQUE_VIOLATION });

		expect(isUniqueViolation(wrapped)).toBe(true);
	});

	it("looks through several layers of wrapping", (): void => {
		const twice = new Error("outer", {
			cause: new Error("inner", { cause: UNIQUE_VIOLATION }),
		});

		expect(isUniqueViolation(twice)).toBe(true);
	});

	it("ignores other constraint violations", (): void => {
		expect(isUniqueViolation(FOREIGN_KEY_VIOLATION)).toBe(false);
		expect(
			isUniqueViolation(
				new Error("Failed query", { cause: FOREIGN_KEY_VIOLATION }),
			),
		).toBe(false);
	});

	it("ignores errors without a code and values that are not errors", (): void => {
		expect(isUniqueViolation(new Error("connect ECONNREFUSED"))).toBe(false);
		expect(isUniqueViolation("23505")).toBe(false);
		expect(isUniqueViolation(null)).toBe(false);
		expect(isUniqueViolation(undefined)).toBe(false);
	});
});
