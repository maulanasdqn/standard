import { Context, Effect, Layer } from "effect";
import { env } from "#/infrastructure/config/env.ts";
import { createDb, type TDb } from "#/infrastructure/db/client.ts";
import { SERVICE_TAG } from "#/infrastructure/service-tags.ts";

export class DbService extends Context.Service<
	DbService,
	{ readonly db: TDb }
>()(SERVICE_TAG.DB) {
	static readonly layer = Layer.effect(
		DbService,
		Effect.sync(() => DbService.of({ db: createDb(env.DATABASE_URL) })),
	);
}
