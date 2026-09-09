import { Context, Effect, Layer } from "effect";
import { createDb, type TDb } from "#/infrastructure/db/client.ts";
import { env } from "#/infrastructure/config/env.ts";

export class DbService extends Context.Service<
	DbService,
	{ readonly db: TDb }
>()("app/DbService") {
	static readonly layer = Layer.effect(
		DbService,
		Effect.sync(() => DbService.of({ db: createDb(env.DATABASE_URL) })),
	);
}
