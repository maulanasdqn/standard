import { actionMailBuild } from "./action-mail.ts";
import { MAIL_MESSAGE } from "./mail-messages.ts";
import type { TMailMessage } from "./mailer.ts";

export type TPasswordChangedMailInput = {
	to: string;
	name: string;
	resetUrl: string;
	brand: string;
};

export const passwordChangedMailBuild = (
	input: TPasswordChangedMailInput,
): TMailMessage =>
	actionMailBuild({
		to: input.to,
		name: input.name,
		brand: input.brand,
		subject: MAIL_MESSAGE.PASSWORD_CHANGED_SUBJECT,
		body: [MAIL_MESSAGE.PASSWORD_CHANGED_BODY],
		action: {
			label: MAIL_MESSAGE.PASSWORD_CHANGED_ACTION,
			url: input.resetUrl,
		},
		footer: MAIL_MESSAGE.PASSWORD_CHANGED_FOOTER,
	});
