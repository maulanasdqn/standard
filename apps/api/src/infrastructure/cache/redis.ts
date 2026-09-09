import { Context, Effect, Layer } from "effect";
import { Redis } from "ioredis";
import { env } from "#/infrastructure/config/env.ts";
import { SERVICE_TAG } from "#/infrastructure/service-tags.ts";

export const createCache = (redisUrl: string): Redis =>
	new Redis(redisUrl, { maxRetriesPerRequest: null });

export class CacheService extends Context.Service<
	CacheService,
	{ readonly client: Redis }
>()(SERVICE_TAG.CACHE) {
	static readonly layer = Layer.effect(
		CacheService,
		Effect.sync(() => CacheService.of({ client: createCache(env.REDIS_URL) })),
	);
}
