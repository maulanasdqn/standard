import { AUTH_MESSAGE } from "@app/messages";
import { describe, expect, it } from "vitest";
import {
	passwordChangeErrorMessage,
	resetPasswordErrorMessage,
	signInErrorMessage,
	signUpErrorMessage,
} from "#/libs/auth/auth-error.ts";

const LIBRARY_MESSAGE = "Invalid email or password";

describe("signInErrorMessage", () => {
	it("names wrong credentials in our own words", (): void => {
		expect(signInErrorMessage({ code: "INVALID_EMAIL_OR_PASSWORD" })).toBe(
			AUTH_MESSAGE.INVALID_CREDENTIALS,
		);
	});

	it("does not blame the credentials for any other failure", (): void => {
		expect(signInErrorMessage({ code: "TOO_MANY_REQUESTS" })).toBe(
			AUTH_MESSAGE.SIGN_IN_FAILED,
		);
		expect(signInErrorMessage({})).toBe(AUTH_MESSAGE.SIGN_IN_FAILED);
	});

	it("never surfaces the library's own wording", (): void => {
		expect(signInErrorMessage({ code: "INVALID_EMAIL_OR_PASSWORD" })).not.toBe(
			LIBRARY_MESSAGE,
		);
	});
});

describe("passwordChangeErrorMessage", () => {
	it("names a wrong current password", (): void => {
		expect(passwordChangeErrorMessage({ code: "INVALID_PASSWORD" })).toBe(
			AUTH_MESSAGE.CURRENT_PASSWORD_INCORRECT,
		);
	});

	it("falls back to a generic failure otherwise", (): void => {
		expect(passwordChangeErrorMessage({})).toBe(
			AUTH_MESSAGE.PASSWORD_CHANGE_FAILED,
		);
	});
});

describe("auth flow error messages", () => {
	it("tells an unverified user to confirm their email", (): void => {
		expect(signInErrorMessage({ code: "EMAIL_NOT_VERIFIED" })).toBe(
			AUTH_MESSAGE.EMAIL_NOT_VERIFIED,
		);
	});

	it("names a taken email on sign-up in our own words", (): void => {
		expect(
			signUpErrorMessage({ code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" }),
		).toBe(AUTH_MESSAGE.EMAIL_TAKEN);
	});

	it("passes the password rule the server broke through to the user", (): void => {
		const weak = { code: "PASSWORD_TOO_WEAK", message: "Include a number." };

		expect(signUpErrorMessage(weak)).toBe(weak.message);
		expect(resetPasswordErrorMessage(weak)).toBe(weak.message);
		expect(passwordChangeErrorMessage(weak)).toBe(weak.message);
	});

	it("explains an expired or reused reset link", (): void => {
		expect(resetPasswordErrorMessage({ code: "INVALID_TOKEN" })).toBe(
			AUTH_MESSAGE.RESET_LINK_INVALID,
		);
	});
});
