import { cacheCreate, type TCache, type TCacheClient } from "@app/cache";
import { Context, Effect, Layer } from "effect";
import { Redis } from "ioredis";
import { env } from "#/platform/config/env.ts";
import type { TServiceId } from "#/shared/service-id.ts";
import { SERVICE_TAG } from "#/platform/service-tags.ts";

const COMMAND_TIMEOUT_MS = 1_000;
const MAX_RETRIES_PER_REQUEST = 1;

export const cacheClientCreate = (redisUrl: string): Redis =>
	new Redis(redisUrl, {
		maxRetriesPerRequest: MAX_RETRIES_PER_REQUEST,
		commandTimeout: COMMAND_TIMEOUT_MS,
		enableOfflineQueue: false,
		lazyConnect: false,
	});

export type TCacheService = {
	readonly client: TCacheClient;
	readonly cache: TCache;
};

export type TCacheServiceId = TServiceId<typeof SERVICE_TAG.CACHE>;

export const CacheService = Context.Service<TCacheServiceId, TCacheService>(
	SERVICE_TAG.CACHE,
);

export const cacheServiceLayer = Layer.effect(
	CacheService,
	Effect.sync(() => {
		const client = cacheClientCreate(env.REDIS_URL);
		client.on("error", (): void => undefined);
		return CacheService.of({ client, cache: cacheCreate(client) });
	}),
);
