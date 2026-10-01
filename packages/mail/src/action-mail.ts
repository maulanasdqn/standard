import {
	mailEscape,
	mailHtmlBuild,
	mailLinkBuild,
	mailTextBuild,
} from "./mail-body.ts";
import { MAIL_MESSAGE } from "./mail-messages.ts";
import type { TMailMessage } from "./mailer.ts";

export type TMailAction = {
	label: string;
	url: string;
};

export type TActionMailInput = {
	to: string;
	name: string;
	brand: string;
	subject: string;
	body: readonly string[];
	action?: TMailAction;
	footer?: string;
};

const signatureOf = (brand: string): string =>
	`${MAIL_MESSAGE.SIGNATURE_PREFIX} ${brand}`;

const greetingOf = (name: string): string =>
	`${MAIL_MESSAGE.GREETING} ${name},`;

export const actionMailBuild = (input: TActionMailInput): TMailMessage => {
	const footer = input.footer === undefined ? [] : [input.footer];

	return {
		to: input.to,
		subject: input.subject,
		text: mailTextBuild([
			greetingOf(input.name),
			...input.body,
			...(input.action === undefined ? [] : [input.action.url]),
			...footer,
			signatureOf(input.brand),
		]),
		html: mailHtmlBuild([
			greetingOf(mailEscape(input.name)),
			...input.body,
			...(input.action === undefined
				? []
				: [mailLinkBuild(input.action.label, input.action.url)]),
			...footer,
			signatureOf(mailEscape(input.brand)),
		]),
	};
};
