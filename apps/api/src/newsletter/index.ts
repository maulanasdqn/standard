import { newsletterSubscriberRepoLayer } from "#/newsletter/infrastructure/newsletter-subscriber-repository.ts";
import { newsletterRouterBuild } from "#/newsletter/presentation/newsletter-router.ts";

export const newsletterModule: {
	layer: typeof newsletterSubscriberRepoLayer;
	routerBuild: typeof newsletterRouterBuild;
} = {
	layer: newsletterSubscriberRepoLayer,
	routerBuild: newsletterRouterBuild,
};
