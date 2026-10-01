import { actionMailBuild } from "./action-mail.ts";
import { MAIL_MESSAGE } from "./mail-messages.ts";
import type { TMailMessage } from "./mailer.ts";

export type TPasswordResetMailInput = {
	to: string;
	name: string;
	url: string;
	brand: string;
};

export const passwordResetMailBuild = (
	input: TPasswordResetMailInput,
): TMailMessage =>
	actionMailBuild({
		to: input.to,
		name: input.name,
		brand: input.brand,
		subject: MAIL_MESSAGE.PASSWORD_RESET_SUBJECT,
		body: [MAIL_MESSAGE.PASSWORD_RESET_BODY],
		action: { label: MAIL_MESSAGE.PASSWORD_RESET_ACTION, url: input.url },
		footer: MAIL_MESSAGE.PASSWORD_RESET_EXPIRY,
	});
