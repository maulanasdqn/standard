import type { TActivityEntry, TActivityRepo } from "@app/core";
import { Context, Effect, Layer } from "effect";
import { EDatabase } from "#/application/shared/errors.ts";
import { DbService } from "#/infrastructure/db/db-service.ts";
import type { TDb } from "#/infrastructure/db/client.ts";
import { activityLog } from "#/infrastructure/db/schema/activity.ts";

export const createActivityRepository = (db: TDb): TActivityRepo => ({
	insert: async (entry: TActivityEntry): Promise<void> => {
		await db.insert(activityLog).values({
			actorId: entry.actorId,
			action: entry.action,
			entityType: entry.entityType,
			entityId: entry.entityId,
			metadata: entry.metadata ?? null,
		});
	},
});

export type IActivityRepo = {
	insert: (entry: TActivityEntry) => Effect.Effect<void, EDatabase>;
};

export class ActivityRepo extends Context.Service<
	ActivityRepo,
	IActivityRepo
>()("app/ActivityRepo") {
	static readonly layer = Layer.effect(
		ActivityRepo,
		Effect.gen(function* () {
			const { db } = yield* DbService;
			const repo = createActivityRepository(db);

			const insert: IActivityRepo["insert"] = (entry: TActivityEntry) =>
				Effect.tryPromise({
					try: () => repo.insert(entry),
					catch: (cause) => new EDatabase({ cause }),
				});

			return ActivityRepo.of({ insert });
		}),
	).pipe(Layer.provide(DbService.layer));
}
