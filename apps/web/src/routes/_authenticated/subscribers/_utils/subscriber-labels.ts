import { NEWSLETTER_MESSAGE } from "@app/messages";
import {
	NEWSLETTER_SOURCE,
	NEWSLETTER_STATUS,
	type TNewsletterSource,
	type TNewsletterStatus,
} from "@app/schemas";
import { match } from "ts-pattern";

export const subscriberStatusLabel = (status: TNewsletterStatus): string =>
	match(status)
		.with(NEWSLETTER_STATUS.PENDING, () => NEWSLETTER_MESSAGE.STATUS_PENDING)
		.with(
			NEWSLETTER_STATUS.CONFIRMED,
			() => NEWSLETTER_MESSAGE.STATUS_CONFIRMED,
		)
		.with(
			NEWSLETTER_STATUS.UNSUBSCRIBED,
			() => NEWSLETTER_MESSAGE.STATUS_UNSUBSCRIBED,
		)
		.exhaustive();

export const subscriberSourceLabel = (source: TNewsletterSource): string =>
	match(source)
		.with(NEWSLETTER_SOURCE.LANDING, () => NEWSLETTER_MESSAGE.SOURCE_LANDING)
		.with(NEWSLETTER_SOURCE.BLOG, () => NEWSLETTER_MESSAGE.SOURCE_BLOG)
		.exhaustive();
