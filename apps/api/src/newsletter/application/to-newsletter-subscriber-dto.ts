import {
	newsletterSubscriberSchema,
	type TNewsletterSubscriber,
} from "@app/schemas";
import type { TNewsletterSubscriberRow } from "#/newsletter/domain/newsletter-subscriber.ts";

export const toNewsletterSubscriberDto = (
	row: TNewsletterSubscriberRow,
): TNewsletterSubscriber =>
	newsletterSubscriberSchema.parse({
		id: row.id,
		email: row.email,
		status: row.status,
		source: row.source,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	});
