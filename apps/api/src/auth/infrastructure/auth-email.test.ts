import type { TMailer } from "@app/mail";
import { describe, expect, it } from "vitest";
import { authEmailOptionsOf } from "#/auth/infrastructure/auth-email.ts";
import type { TAuthEvents } from "#/auth/infrastructure/auth-events.ts";

const optionsWith = (
	signUpEnabled: boolean,
): ReturnType<typeof authEmailOptionsOf> =>
	authEmailOptionsOf({
		mailer: {} as TMailer,
		events: {} as TAuthEvents,
		markVerified: async (): Promise<void> => {},
		signUpEnabled,
	});

describe("authEmailOptionsOf", () => {
	it("refuses self sign-up while it is switched off", (): void => {
		expect(optionsWith(false).emailAndPassword?.disableSignUp).toBe(true);
	});

	it("allows self sign-up once it is switched on", (): void => {
		expect(optionsWith(true).emailAndPassword?.disableSignUp).toBe(false);
	});

	it("keeps password sign-in on either way", (): void => {
		expect(optionsWith(false).emailAndPassword?.enabled).toBe(true);
	});
});
