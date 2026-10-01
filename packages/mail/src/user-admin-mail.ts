import { actionMailBuild } from "./action-mail.ts";
import { MAIL_MESSAGE } from "./mail-messages.ts";
import type { TMailMessage } from "./mailer.ts";

export type TInviteMailInput = {
	to: string;
	name: string;
	url: string;
	brand: string;
};

export type TAccountDeactivatedMailInput = {
	to: string;
	name: string;
	brand: string;
};

export const inviteMailBuild = (input: TInviteMailInput): TMailMessage =>
	actionMailBuild({
		to: input.to,
		name: input.name,
		brand: input.brand,
		subject: MAIL_MESSAGE.INVITE_SUBJECT,
		body: [MAIL_MESSAGE.INVITE_BODY],
		action: { label: MAIL_MESSAGE.INVITE_ACTION, url: input.url },
		footer: MAIL_MESSAGE.INVITE_EXPIRY,
	});

export const accountDeactivatedMailBuild = (
	input: TAccountDeactivatedMailInput,
): TMailMessage =>
	actionMailBuild({
		to: input.to,
		name: input.name,
		brand: input.brand,
		subject: MAIL_MESSAGE.ACCOUNT_DEACTIVATED_SUBJECT,
		body: [MAIL_MESSAGE.ACCOUNT_DEACTIVATED_BODY],
		footer: MAIL_MESSAGE.ACCOUNT_DEACTIVATED_FOOTER,
	});
