import { describe, expect, it } from "vitest";
import { MAIL_MESSAGE } from "./mail-messages.ts";
import { emailChangedMailBuild } from "./user-admin-mail.ts";

const INPUT = {
	to: "old@test.app",
	name: "Member",
	newEmail: "new@test.app",
	brand: "Standard",
};

describe("emailChangedMailBuild", () => {
	it("goes to the previous address with the shared subject", (): void => {
		const message = emailChangedMailBuild(INPUT);

		expect(message.to).toBe(INPUT.to);
		expect(message.subject).toBe(MAIL_MESSAGE.EMAIL_CHANGED_SUBJECT);
	});

	it("names the new address so the owner can tell what changed", (): void => {
		expect(emailChangedMailBuild(INPUT).text).toContain(
			`${MAIL_MESSAGE.EMAIL_CHANGED_NEW_ADDRESS} ${INPUT.newEmail}`,
		);
	});
});
