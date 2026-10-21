import type {
	TNewsletterSubscriberList,
	TNewsletterSubscriberListInput,
} from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import type { EDatabase } from "#/shared/errors.ts";
import { toNewsletterSubscriberDto } from "#/newsletter/application/to-newsletter-subscriber-dto.ts";
import {
	NewsletterSubscriberRepo,
	type TNewsletterSubscriberRepoId,
} from "#/newsletter/domain/newsletter-subscriber.ts";

export const newsletterSubscriberList = Effect.fn("newsletterSubscriberList")(
	function* (
		input: TNewsletterSubscriberListInput,
	): Effect.fn.Return<
		TNewsletterSubscriberList,
		EDatabase,
		TNewsletterSubscriberRepoId
	> {
		const repo = yield* NewsletterSubscriberRepo;
		const { items, total } = yield* repo.list(input);
		return {
			items: A.map(items, toNewsletterSubscriberDto),
			total,
			page: input.page,
			pageSize: input.pageSize,
		};
	},
);
