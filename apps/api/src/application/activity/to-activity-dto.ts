import { activitySchema, type TActivity } from "@app/schemas";
import type { TActivityRow } from "#/domain/activity/activity.ts";

export const toActivityDto = (row: TActivityRow): TActivity =>
	activitySchema.parse({
		id: row.id,
		actorId: row.actorId,
		actorEmail: row.actorEmail,
		action: row.action,
		entityType: row.entityType,
		entityId: row.entityId,
		metadata: row.metadata,
		createdAt: row.createdAt.toISOString(),
	});
