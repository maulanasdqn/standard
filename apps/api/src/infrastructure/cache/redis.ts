import { Context, Effect, Layer } from "effect";
import { Redis } from "ioredis";
import { env } from "#/infrastructure/config/env.ts";

export const createCache = (redisUrl: string): Redis =>
	new Redis(redisUrl, { maxRetriesPerRequest: null });

export class CacheService extends Context.Service<
	CacheService,
	{ readonly client: Redis }
>()("app/CacheService") {
	static readonly layer = Layer.effect(
		CacheService,
		Effect.sync(() => CacheService.of({ client: createCache(env.REDIS_URL) })),
	);
}
