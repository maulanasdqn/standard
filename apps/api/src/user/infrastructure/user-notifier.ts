import {
	accountDeactivatedMailBuild,
	emailChangedMailBuild,
	inviteMailBuild,
	MAIL_TEMPLATE,
	mailSendSafe,
	twoFactorOffMailBuild,
} from "@app/mail";
import { APP_MESSAGE } from "@app/messages";
import { Effect, Layer } from "effect";
import { AuthService } from "#/auth/index.ts";
import { env } from "#/platform/config/env.ts";
import { MailService } from "#/platform/mail/mailer.ts";
import { logger } from "#/platform/observability/logger.ts";
import { UserNotifier } from "#/user/domain/user-notifier.ts";
import type { TUserRow } from "#/user/domain/user.ts";

const MS_PER_DAY = 86_400_000;
const INVITE_EXPIRY_MS = 7 * MS_PER_DAY;
const RESET_TOKEN_PREFIX = "reset-password:";
const INVITE_LANDING = "/reset-password?invite=true";
const INVITE_TOKEN_PREFIX = "inv";
const VERIFY_LANDING = "/verify-email";
const ACCOUNT_LANDING = "/account";
const NOTIFY_FAILED = "user.notify.failed";

const inviteToken = (): string =>
	`${INVITE_TOKEN_PREFIX}${crypto.randomUUID().replaceAll("-", "")}`;

const quietly = (
	label: string,
	run: () => Promise<unknown>,
): Effect.Effect<void> =>
	Effect.promise(() =>
		run()
			.then((): void => undefined)
			.catch((cause: unknown): void => {
				logger.error({ event: NOTIFY_FAILED, notice: label, err: cause });
			}),
	);

export const userNotifierLayer = Layer.effect(
	UserNotifier,
	Effect.gen(function* () {
		const { auth } = yield* AuthService;
		const { mailer } = yield* MailService;

		const inviteSend = async (target: TUserRow): Promise<void> => {
			const ctx = await auth.$context;
			const token = inviteToken();
			await ctx.internalAdapter.createVerificationValue({
				identifier: `${RESET_TOKEN_PREFIX}${token}`,
				value: target.id,
				expiresAt: new Date(Date.now() + INVITE_EXPIRY_MS),
			});
			const landing = encodeURIComponent(`${env.WEB_ORIGIN}${INVITE_LANDING}`);
			await mailSendSafe(
				mailer,
				logger,
				MAIL_TEMPLATE.INVITE,
				inviteMailBuild({
					to: target.email,
					name: target.name,
					url: `${ctx.baseURL}/reset-password/${token}?callbackURL=${landing}`,
					brand: APP_MESSAGE.NAME,
				}),
			);
		};

		return UserNotifier.of({
			invite: (target) =>
				quietly(MAIL_TEMPLATE.INVITE, () => inviteSend(target)),
			deactivated: (target) =>
				quietly(MAIL_TEMPLATE.ACCOUNT_DEACTIVATED, () =>
					mailSendSafe(
						mailer,
						logger,
						MAIL_TEMPLATE.ACCOUNT_DEACTIVATED,
						accountDeactivatedMailBuild({
							to: target.email,
							name: target.name,
							brand: APP_MESSAGE.NAME,
						}),
					),
				),
			emailChanged: (target, previousEmail) =>
				quietly(MAIL_TEMPLATE.EMAIL_CHANGED, () =>
					mailSendSafe(
						mailer,
						logger,
						MAIL_TEMPLATE.EMAIL_CHANGED,
						emailChangedMailBuild({
							to: previousEmail,
							name: target.name,
							newEmail: target.email,
							brand: APP_MESSAGE.NAME,
						}),
					),
				),
			twoFactorReset: (target) =>
				quietly(MAIL_TEMPLATE.TWO_FACTOR_OFF, () =>
					mailSendSafe(
						mailer,
						logger,
						MAIL_TEMPLATE.TWO_FACTOR_OFF,
						twoFactorOffMailBuild({
							to: target.email,
							name: target.name,
							accountUrl: `${env.WEB_ORIGIN}${ACCOUNT_LANDING}`,
							brand: APP_MESSAGE.NAME,
						}),
					),
				),
			emailVerify: (target) =>
				quietly(MAIL_TEMPLATE.EMAIL_VERIFICATION, () =>
					auth.api.sendVerificationEmail({
						body: {
							email: target.email,
							callbackURL: `${env.WEB_ORIGIN}${VERIFY_LANDING}`,
						},
					}),
				),
		});
	}),
);
