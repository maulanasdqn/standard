import { VALIDATION_MESSAGE } from "@app/messages";
import { z } from "zod";
import { baseSchema, type TEntityOf } from "../shared/base-schema.ts";
import { paginated, paginationSchema } from "../shared/pagination.ts";
import { searchQuerySchema } from "../shared/search.ts";
import { SORT_DIRECTION, sortDirectionSchema } from "../shared/sort.ts";

export const NEWSLETTER_EMAIL_MAX = 254;

export const NEWSLETTER_STATUS = {
	PENDING: "pending",
	CONFIRMED: "confirmed",
	UNSUBSCRIBED: "unsubscribed",
} as const;

export type TNewsletterStatus =
	(typeof NEWSLETTER_STATUS)[keyof typeof NEWSLETTER_STATUS];

export const NEWSLETTER_SOURCE = {
	LANDING: "landing",
	BLOG: "blog",
} as const;

export type TNewsletterSource =
	(typeof NEWSLETTER_SOURCE)[keyof typeof NEWSLETTER_SOURCE];

export const NEWSLETTER_SORT = {
	EMAIL: "email",
	CREATED_AT: "createdAt",
} as const;

export type TNewsletterSort =
	(typeof NEWSLETTER_SORT)[keyof typeof NEWSLETTER_SORT];

const newsletterEmailSchema = z
	.email(VALIDATION_MESSAGE.EMAIL_INVALID)
	.max(NEWSLETTER_EMAIL_MAX)
	.toLowerCase();

export const newsletterStatusSchema = z.enum([
	NEWSLETTER_STATUS.PENDING,
	NEWSLETTER_STATUS.CONFIRMED,
	NEWSLETTER_STATUS.UNSUBSCRIBED,
]);

export const newsletterSourceSchema = z.enum([
	NEWSLETTER_SOURCE.LANDING,
	NEWSLETTER_SOURCE.BLOG,
]);

export const newsletterSubscriberSchema = baseSchema(z.uuid()).extend({
	email: newsletterEmailSchema,
	status: newsletterStatusSchema,
	source: newsletterSourceSchema,
});
export type TNewsletterSubscriber = TEntityOf<
	z.infer<typeof newsletterSubscriberSchema>
>;

export const newsletterSubscribeInputSchema = z.object({
	email: newsletterEmailSchema,
	source: newsletterSourceSchema.default(NEWSLETTER_SOURCE.LANDING),
});
export type TNewsletterSubscribeInput = z.infer<
	typeof newsletterSubscribeInputSchema
>;

export const newsletterSubscribeOutputSchema = z.object({
	email: newsletterEmailSchema,
});
export type TNewsletterSubscribeOutput = z.infer<
	typeof newsletterSubscribeOutputSchema
>;

export const newsletterSubscriberIdInputSchema = z.object({ id: z.uuid() });
export type TNewsletterSubscriberIdInput = z.infer<
	typeof newsletterSubscriberIdInputSchema
>;

export const newsletterSubscriberListInputSchema = paginationSchema.extend({
	search: searchQuerySchema.optional(),
	status: newsletterStatusSchema.optional(),
	sortBy: z
		.enum([NEWSLETTER_SORT.EMAIL, NEWSLETTER_SORT.CREATED_AT])
		.default(NEWSLETTER_SORT.CREATED_AT),
	sortDir: sortDirectionSchema.default(SORT_DIRECTION.DESC),
});
export type TNewsletterSubscriberListInput = z.infer<
	typeof newsletterSubscriberListInputSchema
>;

export const newsletterSubscriberListSchema = paginated(
	newsletterSubscriberSchema,
);
export type TNewsletterSubscriberList = z.infer<
	typeof newsletterSubscriberListSchema
>;
