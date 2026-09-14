import {
	rateLimitCheck,
	type TCacheClient,
	type TRateLimitResult,
} from "@app/cache";
import { ERROR_MESSAGE } from "@app/messages";
import type { Context, Next } from "hono";
import { match } from "ts-pattern";
import { HTTP_STATUS } from "#/presentation/http-status.ts";
import type { TRateLimitScope } from "#/presentation/rate-limit-scopes.ts";

export type TRateLimitOptions = {
	client: TCacheClient;
	scope: TRateLimitScope;
	windowSeconds: number;
	max: number;
};

const UNKNOWN_IDENTIFIER = "unknown";

const identifierOf = (context: Context): string =>
	context.req.header("x-forwarded-for") ??
	context.req.header("x-real-ip") ??
	UNKNOWN_IDENTIFIER;

export const rateLimit =
	(options: TRateLimitOptions) =>
	async (context: Context, next: Next): Promise<Response | undefined> => {
		const result = await rateLimitCheck(options.client, {
			identifier: identifierOf(context),
			scope: options.scope,
			windowSeconds: options.windowSeconds,
			max: options.max,
		}).catch(
			(): TRateLimitResult => ({
				allowed: true,
				count: 0,
				remaining: options.max,
			}),
		);

		return match(result.allowed)
			.with(
				false,
				(): Response =>
					context.json(
						{ message: ERROR_MESSAGE.TOO_MANY_REQUESTS },
						HTTP_STATUS.TOO_MANY_REQUESTS,
					),
			)
			.otherwise(async (): Promise<undefined> => {
				await next();
				return undefined;
			});
	};
