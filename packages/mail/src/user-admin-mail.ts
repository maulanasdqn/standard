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

export type TTwoFactorOffMailInput = {
	to: string;
	name: string;
	accountUrl: string;
	brand: string;
};

export const twoFactorOffMailBuild = (
	input: TTwoFactorOffMailInput,
): TMailMessage =>
	actionMailBuild({
		to: input.to,
		name: input.name,
		brand: input.brand,
		subject: MAIL_MESSAGE.TWO_FACTOR_OFF_SUBJECT,
		body: [MAIL_MESSAGE.TWO_FACTOR_OFF_BODY],
		action: {
			label: MAIL_MESSAGE.TWO_FACTOR_OFF_ACTION,
			url: input.accountUrl,
		},
		footer: MAIL_MESSAGE.TWO_FACTOR_OFF_FOOTER,
	});

export type TEmailChangedMailInput = {
	to: string;
	name: string;
	newEmail: string;
	brand: string;
};

export const emailChangedMailBuild = (
	input: TEmailChangedMailInput,
): TMailMessage =>
	actionMailBuild({
		to: input.to,
		name: input.name,
		brand: input.brand,
		subject: MAIL_MESSAGE.EMAIL_CHANGED_SUBJECT,
		body: [
			MAIL_MESSAGE.EMAIL_CHANGED_BODY,
			`${MAIL_MESSAGE.EMAIL_CHANGED_NEW_ADDRESS} ${input.newEmail}`,
		],
		footer: MAIL_MESSAGE.EMAIL_CHANGED_FOOTER,
	});
