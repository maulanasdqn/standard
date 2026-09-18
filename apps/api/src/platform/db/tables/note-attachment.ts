import {
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { note } from "./note.ts";

export const noteAttachment = pgTable(
	"note_attachment",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		noteId: uuid("note_id")
			.notNull()
			.references(() => note.id, { onDelete: "cascade" }),
		storageKey: text("storage_key").notNull().unique(),
		fileName: text("file_name").notNull(),
		contentType: text("content_type").notNull(),
		byteSize: integer("byte_size").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [index("note_attachment_note_id_idx").on(table.noteId)],
);

export const noteAttachmentReap = pgTable(
	"note_attachment_reap",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		storageKey: text("storage_key").notNull().unique(),
		reapAfter: timestamp("reap_after", { withTimezone: true }).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [index("note_attachment_reap_after_idx").on(table.reapAfter)],
);
