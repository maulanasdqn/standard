import { actionMailBuild } from "./action-mail.ts";
import { MAIL_MESSAGE } from "./mail-messages.ts";
import type { TMailMessage } from "./mailer.ts";

export type TEmailVerificationMailInput = {
	to: string;
	name: string;
	url: string;
	brand: string;
};

export const emailVerificationMailBuild = (
	input: TEmailVerificationMailInput,
): TMailMessage =>
	actionMailBuild({
		to: input.to,
		name: input.name,
		brand: input.brand,
		subject: MAIL_MESSAGE.EMAIL_VERIFICATION_SUBJECT,
		body: [MAIL_MESSAGE.EMAIL_VERIFICATION_BODY],
		action: { label: MAIL_MESSAGE.EMAIL_VERIFICATION_ACTION, url: input.url },
		footer: MAIL_MESSAGE.EMAIL_VERIFICATION_EXPIRY,
	});
