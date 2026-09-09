import type { Context, Next } from "hono";
import type { Redis } from "ioredis";
import { match } from "ts-pattern";

type TRateLimitOptions = {
	cache: Redis;
	windowSeconds: number;
	max: number;
	keyPrefix: string;
};

export const rateLimit =
	({ cache, windowSeconds, max, keyPrefix }: TRateLimitOptions) =>
	async (context: Context, next: Next): Promise<Response | undefined> => {
		const ip =
			context.req.header("x-forwarded-for") ??
			context.env?.remoteAddr ??
			"unknown";
		const key = `${keyPrefix}:${ip}`;

		const count = await cache.incr(key);

		await match(count)
			.with(1, () => cache.expire(key, windowSeconds))
			.otherwise(() => undefined);

		return match(count > max)
			.with(true, () => context.json({ error: "Too many requests" }, 429))
			.otherwise(async (): Promise<undefined> => {
				await next();
				return undefined;
			});
	};
