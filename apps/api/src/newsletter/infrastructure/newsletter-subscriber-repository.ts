import { NEWSLETTER_SORT, type TNewsletterSort } from "@app/schemas";
import { count, eq } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { Effect, Layer } from "effect";
import { EDatabase } from "#/shared/errors.ts";
import {
	NewsletterSubscriberRepo,
	type TNewsletterSubscriberRepo,
} from "#/newsletter/domain/newsletter-subscriber.ts";
import { newsletterSubscriberListWhere } from "#/newsletter/infrastructure/newsletter-subscriber-list-where.ts";
import { offsetFor, orderFor } from "#/shared/pagination.ts";
import { DbService } from "#/platform/db/db-service.ts";
import { dbActive } from "#/platform/db/transaction.ts";
import { newsletterSubscriber } from "#/platform/db/tables/newsletter-subscriber.ts";

const SORT_COLUMN: Record<TNewsletterSort, AnyPgColumn> = {
	[NEWSLETTER_SORT.EMAIL]: newsletterSubscriber.email,
	[NEWSLETTER_SORT.CREATED_AT]: newsletterSubscriber.createdAt,
};

export const newsletterSubscriberRepoLayer = Layer.effect(
	NewsletterSubscriberRepo,
	Effect.gen(function* () {
		const { db } = yield* DbService;

		const subscribe: TNewsletterSubscriberRepo["subscribe"] = ({
			email,
			source,
		}) =>
			Effect.tryPromise({
				try: async () => {
					await dbActive(db)
						.insert(newsletterSubscriber)
						.values({ email, source })
						.onConflictDoNothing({ target: newsletterSubscriber.email });
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const list: TNewsletterSubscriberRepo["list"] = (input) => {
			const { page, pageSize, sortBy, sortDir } = input;
			const where = newsletterSubscriberListWhere(input);

			return Effect.tryPromise({
				try: async () => {
					const [items, [{ value: total }]] = await Promise.all([
						dbActive(db)
							.select()
							.from(newsletterSubscriber)
							.where(where)
							.limit(pageSize)
							.offset(offsetFor({ page, pageSize }))
							.orderBy(orderFor(SORT_COLUMN[sortBy], sortDir)),
						dbActive(db)
							.select({ value: count() })
							.from(newsletterSubscriber)
							.where(where),
					]);
					return { items, total };
				},
				catch: (cause) => new EDatabase({ cause }),
			});
		};

		const findById: TNewsletterSubscriberRepo["findById"] = (id) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(newsletterSubscriber)
						.where(eq(newsletterSubscriber.id, id))
						.limit(1);
					return row ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const remove: TNewsletterSubscriberRepo["remove"] = (id) =>
			Effect.tryPromise({
				try: async () => {
					const result = await dbActive(db)
						.delete(newsletterSubscriber)
						.where(eq(newsletterSubscriber.id, id))
						.returning({ id: newsletterSubscriber.id });
					return result.length > 0;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		return NewsletterSubscriberRepo.of({ subscribe, list, findById, remove });
	}),
);
