import type {
	TNewsletterSubscribeInput,
	TNewsletterSubscribeOutput,
} from "@app/schemas";
import { Effect } from "effect";
import type { EDatabase } from "#/shared/errors.ts";
import {
	NewsletterSubscriberRepo,
	type TNewsletterSubscriberRepoId,
} from "#/newsletter/domain/newsletter-subscriber.ts";

export const newsletterSubscribe = Effect.fn("newsletterSubscribe")(function* (
	input: TNewsletterSubscribeInput,
): Effect.fn.Return<
	TNewsletterSubscribeOutput,
	EDatabase,
	TNewsletterSubscriberRepoId
> {
	const repo = yield* NewsletterSubscriberRepo;
	yield* repo.subscribe(input);
	return { email: input.email };
});
