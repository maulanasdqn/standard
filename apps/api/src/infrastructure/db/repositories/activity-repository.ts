import type { TActivityEntry, TActivityRepo } from "@app/activity";
import { Context, Effect, Layer } from "effect";
import { EDatabase } from "#/application/shared/errors.ts";
import type { TDb } from "#/infrastructure/db/client.ts";
import { DbService } from "#/infrastructure/db/db-service.ts";
import { activityLog } from "#/infrastructure/db/schema/activity.ts";
import { SERVICE_TAG } from "#/infrastructure/service-tags.ts";

export const activityRepositoryCreate = (db: TDb): TActivityRepo => ({
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

export type TActivityRepoShape = {
	insert: (entry: TActivityEntry) => Effect.Effect<void, EDatabase>;
};

export class ActivityRepo extends Context.Service<
	ActivityRepo,
	TActivityRepoShape
>()(SERVICE_TAG.ACTIVITY_REPO) {
	static readonly layer = Layer.effect(
		ActivityRepo,
		Effect.gen(function* () {
			const { db } = yield* DbService;
			const repo = activityRepositoryCreate(db);

			const insert: TActivityRepoShape["insert"] = (entry: TActivityEntry) =>
				Effect.tryPromise({
					try: () => repo.insert(entry),
					catch: (cause) => new EDatabase({ cause }),
				});

			return ActivityRepo.of({ insert });
		}),
	).pipe(Layer.provide(DbService.layer));
}
