import type {
	TNewsletterSource,
	TNewsletterStatus,
	TNewsletterSubscribeInput,
	TNewsletterSubscriberListInput,
} from "@app/schemas";
import { Context, type Effect } from "effect";
import type { TBaseRow } from "#/shared/base-row.ts";
import type { EDatabase } from "#/shared/errors.ts";
import type { TRowPage } from "#/shared/pagination.ts";
import { REPO_TAG } from "#/shared/repo-tags.ts";
import type { TServiceId } from "#/shared/service-id.ts";

export type TNewsletterSubscriberRow = TBaseRow & {
	email: string;
	status: TNewsletterStatus;
	source: TNewsletterSource;
};

export type TNewsletterSubscriberRepo = {
	subscribe: (
		input: TNewsletterSubscribeInput,
	) => Effect.Effect<void, EDatabase>;
	list: (
		input: TNewsletterSubscriberListInput,
	) => Effect.Effect<TRowPage<TNewsletterSubscriberRow>, EDatabase>;
	findById: (
		id: string,
	) => Effect.Effect<TNewsletterSubscriberRow | null, EDatabase>;
	remove: (id: string) => Effect.Effect<boolean, EDatabase>;
};

export type TNewsletterSubscriberRepoId = TServiceId<
	typeof REPO_TAG.NEWSLETTER_SUBSCRIBER
>;

export const NewsletterSubscriberRepo = Context.Service<
	TNewsletterSubscriberRepoId,
	TNewsletterSubscriberRepo
>(REPO_TAG.NEWSLETTER_SUBSCRIBER);
