import { Context, Effect, Layer } from "effect";
import { env } from "#/infrastructure/config/env.ts";
import { dbCreate, type TDb } from "#/infrastructure/db/client.ts";
import { SERVICE_TAG } from "#/infrastructure/service-tags.ts";

export type IDbService = { readonly db: TDb };

export class DbService extends Context.Service<DbService, IDbService>()(
	SERVICE_TAG.DB,
) {
	static readonly layer = Layer.effect(
		DbService,
		Effect.sync(() => DbService.of({ db: dbCreate(env.DATABASE_URL) })),
	);
}
