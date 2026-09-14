import { Context, Effect, Layer } from "effect";
import { env } from "#/infrastructure/config/env.ts";
import { dbCreate, type TDb } from "#/infrastructure/db/client.ts";
import type { TServiceId } from "#/domain/shared/service-id.ts";
import { SERVICE_TAG } from "#/infrastructure/service-tags.ts";

export type TDbService = { readonly db: TDb };

export type TDbServiceId = TServiceId<typeof SERVICE_TAG.DB>;

export const DbService = Context.Service<TDbServiceId, TDbService>(
	SERVICE_TAG.DB,
);

export const dbServiceLayer = Layer.effect(
	DbService,
	Effect.sync(() => DbService.of({ db: dbCreate(env.DATABASE_URL) })),
);
