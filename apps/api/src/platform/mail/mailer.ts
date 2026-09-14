import { mailerCreate, type TMailer } from "@app/mail";
import { Context, Effect, Layer } from "effect";
import { env } from "#/platform/config/env.ts";
import type { TServiceId } from "#/shared/service-id.ts";
import { SERVICE_TAG } from "#/platform/service-tags.ts";

export type TMailService = { readonly mailer: TMailer };

export type TMailServiceId = TServiceId<typeof SERVICE_TAG.MAIL>;

export const MailService = Context.Service<TMailServiceId, TMailService>(
	SERVICE_TAG.MAIL,
);

export const mailServiceLayer = Layer.effect(
	MailService,
	Effect.sync(() =>
		MailService.of({
			mailer: mailerCreate({ smtpUrl: env.SMTP_URL, from: env.MAIL_FROM }),
		}),
	),
);
