import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { z } from "zod";
import { eventSchema, type TEventOf } from "../shared/base-schema.ts";
import { paginated, paginationSchema } from "../shared/pagination.ts";

export const activitySchema = eventSchema(z.uuid()).extend({
	actorId: z.string().nullable(),
	actorEmail: z.email().nullable(),
	action: z.enum(ACTIVITY_ACTION),
	resourceType: z.enum(ACTIVITY_RESOURCE_TYPE),
	resourceId: z.string(),
	metadata: z.unknown(),
});
export type TActivity = TEventOf<z.infer<typeof activitySchema>>;

export const activityListInputSchema = paginationSchema.extend({
	action: z.string().optional(),
	resourceType: z.string().optional(),
	actorId: z.string().optional(),
});
export type TActivityListInput = z.infer<typeof activityListInputSchema>;

export const activityListSchema = paginated(activitySchema);
export type TActivityList = z.infer<typeof activityListSchema>;
