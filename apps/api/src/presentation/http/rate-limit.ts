import type { Context, Next } from "hono";
import type { Redis } from "ioredis";

type TRateLimitOptions = {
	cache: Redis;
	windowSeconds: number;
	max: number;
	keyPrefix: string;
};

/** Fixed-window rate limiter backed by Redis; keyed by client IP. */
export const rateLimit =
	({ cache, windowSeconds, max, keyPrefix }: TRateLimitOptions) =>
	async (context: Context, next: Next) => {
		const ip =
			context.req.header("x-forwarded-for") ??
			context.env?.remoteAddr ??
			"unknown";
		const key = `${keyPrefix}:${ip}`;

		const count = await cache.incr(key);
		if (count === 1) {
			await cache.expire(key, windowSeconds);
		}

		if (count > max) {
			return context.json({ error: "Too many requests" }, 429);
		}

		await next();
	};
