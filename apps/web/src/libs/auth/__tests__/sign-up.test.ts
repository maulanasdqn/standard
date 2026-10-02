import { describe, expect, it } from "vitest";
import { signUpEnabledOf } from "#/libs/auth/sign-up.ts";

describe("signUpEnabledOf", () => {
	it.each(["true", "TRUE", " true "])(
		"turns sign-up on for %j",
		(value): void => {
			expect(signUpEnabledOf(value)).toBe(true);
		},
	);

	it.each([undefined, "", "false", "1", "yes"])(
		"keeps sign-up off for %j",
		(value): void => {
			expect(signUpEnabledOf(value)).toBe(false);
		},
	);
});
