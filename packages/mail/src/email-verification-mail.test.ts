import { describe, expect, it } from "vitest";
import { emailVerificationMailBuild } from "./email-verification-mail.ts";
import { MAIL_MESSAGE } from "./mail-messages.ts";

const INPUT = {
	to: "new@test.app",
	name: "New <b>user</b>",
	url: "https://standard.test/api/auth/verify-email?token=abc&callbackURL=x",
	brand: "Acme",
};

describe("emailVerificationMailBuild", () => {
	it("uses the verification subject and carries the link", () => {
		const message = emailVerificationMailBuild(INPUT);

		expect(message.subject).toBe(MAIL_MESSAGE.EMAIL_VERIFICATION_SUBJECT);
		expect(message.text).toContain(INPUT.url);
	});

	it("escapes the name in the html body so it cannot inject markup", () => {
		const html = emailVerificationMailBuild(INPUT).html;

		expect(html).toContain("New &lt;b&gt;user&lt;/b&gt;");
		expect(html).not.toContain("<b>user</b>");
	});

	it("escapes the link so the query string stays well formed", () => {
		expect(emailVerificationMailBuild(INPUT).html).toContain(
			"token=abc&amp;callbackURL=x",
		);
	});
});
