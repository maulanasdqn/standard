import type { TActivityEntry, TActivityRepo } from "@app/core";
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
