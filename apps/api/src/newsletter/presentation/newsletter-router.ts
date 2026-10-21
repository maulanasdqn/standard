import { PERMISSION } from "@app/permissions";
import { newsletterSubscribe } from "#/newsletter/application/newsletter-subscribe.ts";
import { newsletterSubscriberDelete } from "#/newsletter/application/newsletter-subscriber-delete.ts";
import { newsletterSubscriberList } from "#/newsletter/application/newsletter-subscriber-list.ts";
import { implementer, permissionGuarded } from "#/platform/orpc/implementer.ts";
import {
	effectRun,
	effectRunTransactional,
} from "#/platform/orpc/run-effect.ts";

const newsletterRouter = implementer.newsletter.router({
	subscribe: implementer.newsletter.subscribe.handler(({ input, context }) =>
		effectRunTransactional(context.runtime, newsletterSubscribe(input)),
	),

	list: permissionGuarded(PERMISSION.NEWSLETTER_READ).newsletter.list.handler(
		({ input, context }) =>
			effectRun(context.runtime, newsletterSubscriberList(input)),
	),

	remove: permissionGuarded(
		PERMISSION.NEWSLETTER_DELETE,
	).newsletter.remove.handler(({ input, context }) =>
		effectRunTransactional(
			context.runtime,
			newsletterSubscriberDelete(input, context.session.user.id),
		),
	),
});

export type TNewsletterRouter = typeof newsletterRouter;

export const newsletterRouterBuild = (): TNewsletterRouter => newsletterRouter;
