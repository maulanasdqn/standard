import { AUTH_MESSAGE } from "@app/messages";
import { describe, expect, it } from "vitest";
import {
	signInErrorMessage,
	twoFactorErrorMessage,
} from "#/libs/auth/auth-error.ts";
import { DEVICE_KIND, deviceKindOf } from "#/libs/auth/device.ts";
import { isTwoFactorPending } from "#/libs/auth/two-factor.ts";

describe("isTwoFactorPending", () => {
	it("spots a sign-in that still needs a code", (): void => {
		expect(isTwoFactorPending({ twoFactorRedirect: true })).toBe(true);
	});

	it("ignores a finished sign-in and an empty answer", (): void => {
		expect(isTwoFactorPending({ token: "abc", user: {} })).toBe(false);
		expect(isTwoFactorPending(null)).toBe(false);
	});
});

describe("twoFactorErrorMessage", () => {
	it("sends the user back to sign in when the challenge expired", (): void => {
		expect(twoFactorErrorMessage({ code: "INVALID_TWO_FACTOR_COOKIE" })).toBe(
			AUTH_MESSAGE.TWO_FACTOR_EXPIRED,
		);
	});

	it("stops after too many wrong codes", (): void => {
		expect(
			twoFactorErrorMessage({ code: "TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE" }),
		).toBe(AUTH_MESSAGE.TWO_FACTOR_TOO_MANY);
	});

	it("calls anything else a wrong code", (): void => {
		expect(twoFactorErrorMessage({ code: "INVALID_CODE" })).toBe(
			AUTH_MESSAGE.TWO_FACTOR_INVALID_CODE,
		);
	});
});

describe("signInErrorMessage for a deactivated account", () => {
	it("explains that the account was deactivated", (): void => {
		expect(signInErrorMessage({ code: "ACCOUNT_DEACTIVATED" })).toBe(
			AUTH_MESSAGE.ACCOUNT_DEACTIVATED,
		);
	});
});

describe("deviceKindOf", () => {
	it("treats a mobile agent as mobile and anything else as desktop", (): void => {
		expect(deviceKindOf("Something Mobile Safari")).toBe(DEVICE_KIND.MOBILE);
		expect(deviceKindOf("Some desktop browser")).toBe(DEVICE_KIND.DESKTOP);
		expect(deviceKindOf(null)).toBe(DEVICE_KIND.DESKTOP);
	});
});
