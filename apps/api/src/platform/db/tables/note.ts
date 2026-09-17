import {
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth.ts";

export const NOTE_VERSION_INITIAL = 1;

export const note = pgTable(
	"note",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		title: text("title").notNull(),
		body: text("body").notNull().default(""),
		version: integer("version").notNull().default(NOTE_VERSION_INITIAL),
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [index("note_author_id_idx").on(table.authorId)],
);
