import {
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const activityLog = pgTable(
	"activity_log",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		actorId: text("actor_id"),
		action: text("action").notNull(),
		entityType: text("entity_type").notNull(),
		entityId: text("entity_id").notNull(),
		metadata: jsonb("metadata"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("activity_log_entity_idx").on(table.entityType, table.entityId),
	],
);
