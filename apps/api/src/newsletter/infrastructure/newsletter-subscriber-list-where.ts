import type {
	TNewsletterStatus,
	TNewsletterSubscriberListInput,
} from "@app/schemas";
import { and, eq, type SQL } from "drizzle-orm";
import { match, P } from "ts-pattern";
import { containsWhere } from "#/platform/db/search.ts";
import { newsletterSubscriber } from "#/platform/db/tables/newsletter-subscriber.ts";

const searchWhere = (search: string | undefined): SQL | undefined =>
	match(search)
		.with(
			P.nonNullable,
			(value): SQL => containsWhere(newsletterSubscriber.email, value),
		)
		.otherwise((): undefined => undefined);

const statusWhere = (status: TNewsletterStatus | undefined): SQL | undefined =>
	match(status)
		.with(P.nonNullable, (value): SQL => eq(newsletterSubscriber.status, value))
		.otherwise((): undefined => undefined);

export const newsletterSubscriberListWhere = (
	input: TNewsletterSubscriberListInput,
): SQL | undefined => and(searchWhere(input.search), statusWhere(input.status));
