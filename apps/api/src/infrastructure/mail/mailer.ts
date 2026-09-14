import { mailerCreate, type TMailer } from "@app/mail";
import { Context, Effect, Layer } from "effect";
import { env } from "#/infrastructure/config/env.ts";
import { SERVICE_TAG } from "#/infrastructure/service-tags.ts";

export type TMailService = { readonly mailer: TMailer };

export class MailService extends Context.Service<MailService, TMailService>()(
	SERVICE_TAG.MAIL,
) {
	static readonly layer = Layer.effect(
		MailService,
		Effect.sync(() =>
			MailService.of({
				mailer: mailerCreate({ smtpUrl: env.SMTP_URL, from: env.MAIL_FROM }),
			}),
		),
	);
}
