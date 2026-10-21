import {
	newsletterSubscribeInputSchema,
	newsletterSubscribeOutputSchema,
	newsletterSubscriberIdInputSchema,
	newsletterSubscriberListInputSchema,
	newsletterSubscriberListSchema,
} from "@app/schemas";
import { oc } from "@orpc/contract";
import { z } from "zod";
import { HTTP_METHOD } from "./http-methods.ts";
import { ROUTE_PATH } from "./route-paths.ts";

export const newsletterContract = {
	subscribe: oc
		.route({
			method: HTTP_METHOD.POST,
			path: ROUTE_PATH.NEWSLETTER_SUBSCRIPTIONS,
		})
		.input(newsletterSubscribeInputSchema)
		.output(newsletterSubscribeOutputSchema),

	list: oc
		.route({ method: HTTP_METHOD.GET, path: ROUTE_PATH.NEWSLETTER_SUBSCRIBERS })
		.input(newsletterSubscriberListInputSchema)
		.output(newsletterSubscriberListSchema),

	remove: oc
		.route({
			method: HTTP_METHOD.DELETE,
			path: ROUTE_PATH.NEWSLETTER_SUBSCRIBER,
		})
		.input(newsletterSubscriberIdInputSchema)
		.output(z.object({ id: z.uuid() })),
};
