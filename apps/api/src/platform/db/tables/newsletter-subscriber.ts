import {
	NEWSLETTER_SOURCE,
	NEWSLETTER_STATUS,
	type TNewsletterSource,
	type TNewsletterStatus,
} from "@app/schemas";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const newsletterSubscriber = pgTable("newsletter_subscriber", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: text("email").notNull().unique(),
	status: text("status")
		.$type<TNewsletterStatus>()
		.notNull()
		.default(NEWSLETTER_STATUS.PENDING),
	source: text("source")
		.$type<TNewsletterSource>()
		.notNull()
		.default(NEWSLETTER_SOURCE.LANDING),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});
