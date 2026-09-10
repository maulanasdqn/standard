import { Context, Effect, Layer } from "effect";
import { Redis } from "ioredis";
import { env } from "#/infrastructure/config/env.ts";
import { SERVICE_TAG } from "#/infrastructure/service-tags.ts";

export const cacheCreate = (redisUrl: string): Redis =>
	new Redis(redisUrl, { maxRetriesPerRequest: null });

export type TCacheService = { readonly client: Redis };

export class CacheService extends Context.Service<
	CacheService,
	TCacheService
>()(SERVICE_TAG.CACHE) {
	static readonly layer = Layer.effect(
		CacheService,
		Effect.sync(() => CacheService.of({ client: cacheCreate(env.REDIS_URL) })),
	);
}
