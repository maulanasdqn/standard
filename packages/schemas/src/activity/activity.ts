import { z } from "zod";
import { paginated, paginationSchema } from "../shared/pagination.ts";

export const activitySchema = z.object({
	id: z.uuid(),
	actorId: z.string().nullable(),
	actorEmail: z.email().nullable(),
	action: z.string(),
	entityType: z.string(),
	entityId: z.string(),
	metadata: z.unknown(),
	createdAt: z.iso.datetime(),
});
export type TActivity = z.infer<typeof activitySchema>;

export const activityListInputSchema = paginationSchema.extend({
	action: z.string().optional(),
	entityType: z.string().optional(),
	actorId: z.string().optional(),
});
export type TActivityListInput = z.infer<typeof activityListInputSchema>;

export const activityListSchema = paginated(activitySchema);
export type TActivityList = z.infer<typeof activityListSchema>;
