import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "#/platform/db/tables/auth.ts";

export const twoFactor = pgTable(
	"two_factor",
	{
		id: text("id").primaryKey(),
		secret: text("secret").notNull(),
		backupCodes: text("backup_codes").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		verified: boolean("verified").default(true),
		failedVerificationCount: integer("failed_verification_count").default(0),
		lockedUntil: timestamp("locked_until", { withTimezone: true }),
	},
	(table) => [
		index("two_factor_secret_idx").on(table.secret),
		index("two_factor_user_id_idx").on(table.userId),
	],
);
