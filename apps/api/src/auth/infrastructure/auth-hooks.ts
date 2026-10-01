import { A } from "@mobily/ts-belt";
import type { BetterAuthOptions } from "better-auth";
import {
	APIError,
	createAuthMiddleware,
	getSessionFromCtx,
} from "better-auth/api";
import { match } from "ts-pattern";
import { z } from "zod";
import { passwordStrengthAssert } from "#/auth/infrastructure/auth-password-hook.ts";
import type { TAuthEvents } from "#/auth/infrastructure/auth-events.ts";

export const AUTH_EVENT_PATH = {
	SIGN_UP: "/sign-up/email",
	SIGN_IN: "/sign-in/email",
	SIGN_OUT: "/sign-out",
	CHANGE_PASSWORD: "/change-password",
	UPDATE_USER: "/update-user",
	REVOKE_SESSION: "/revoke-session",
	REVOKE_OTHER_SESSIONS: "/revoke-other-sessions",
	REVOKE_SESSIONS: "/revoke-sessions",
	TWO_FACTOR_VERIFY: "/two-factor/verify-totp",
	TWO_FACTOR_DISABLE: "/two-factor/disable",
} as const;

const REVOKE_PATHS: readonly string[] = [
	AUTH_EVENT_PATH.REVOKE_SESSION,
	AUTH_EVENT_PATH.REVOKE_OTHER_SESSIONS,
	AUTH_EVENT_PATH.REVOKE_SESSIONS,
];

const emailBodySchema = z.object({ email: z.string() });
const nameBodySchema = z.object({ name: z.string() });
const signUpResultSchema = z.object({
	user: z.object({ id: z.string(), email: z.string(), name: z.string() }),
});

type THookContext = Parameters<Parameters<typeof createAuthMiddleware>[0]>[0];

type THookSession = Awaited<ReturnType<typeof getSessionFromCtx>>;

const sessionOf = async (ctx: THookContext): Promise<THookSession> =>
	ctx.context.session ?? (await getSessionFromCtx(ctx));

const afterSuccess = async (
	ctx: THookContext,
	events: TAuthEvents,
): Promise<void> => {
	const session = await sessionOf(ctx);
	const user = session?.user;
	await match(ctx.path)
		.with(AUTH_EVENT_PATH.SIGN_UP, async (): Promise<void> => {
			const parsed = signUpResultSchema.safeParse(ctx.context.returned);
			return parsed.success ? events.signedUp(parsed.data.user) : undefined;
		})
		.with(
			AUTH_EVENT_PATH.CHANGE_PASSWORD,
			async (): Promise<void> =>
				user ? events.passwordChanged(user) : undefined,
		)
		.with(
			AUTH_EVENT_PATH.TWO_FACTOR_VERIFY,
			async (): Promise<void> =>
				ctx.context.session
					? events.twoFactorEnabled(ctx.context.session.user)
					: undefined,
		)
		.with(
			AUTH_EVENT_PATH.TWO_FACTOR_DISABLE,
			async (): Promise<void> =>
				user ? events.twoFactorDisabled(user) : undefined,
		)
		.with(AUTH_EVENT_PATH.UPDATE_USER, async (): Promise<void> => {
			const body = nameBodySchema.safeParse(ctx.body);
			return user && body.success && body.data.name !== user.name
				? events.profileUpdated(user.id, body.data.name, user.name)
				: undefined;
		})
		.when(
			(path) => A.includes(REVOKE_PATHS, path),
			async (): Promise<void> =>
				session
					? events.sessionsRevoked(session.user.id, session.session.id)
					: undefined,
		)
		.otherwise(async (): Promise<void> => undefined);
};

const afterFailure = async (
	ctx: THookContext,
	events: TAuthEvents,
): Promise<void> => {
	const body = emailBodySchema.safeParse(ctx.body);
	return ctx.path === AUTH_EVENT_PATH.SIGN_IN && body.success
		? events.signInFailed(body.data.email.toLowerCase())
		: undefined;
};

export const authHooksOf = (
	events: TAuthEvents,
): NonNullable<BetterAuthOptions["hooks"]> => ({
	before: createAuthMiddleware(async (ctx): Promise<void> => {
		passwordStrengthAssert(ctx.path, ctx.body);
		const session =
			ctx.path === AUTH_EVENT_PATH.SIGN_OUT
				? await getSessionFromCtx(ctx)
				: null;
		return session
			? events.signedOut(session.user.id, session.session.id)
			: undefined;
	}),
	after: createAuthMiddleware(
		async (ctx): Promise<void> =>
			ctx.context.returned instanceof APIError
				? afterFailure(ctx, events)
				: afterSuccess(ctx, events),
	),
});
