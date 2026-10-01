import { Layer } from "effect";
import { userNotifierLayer } from "#/user/infrastructure/user-notifier.ts";
import { userRepoLayer } from "#/user/infrastructure/user-repository.ts";
import { userRouterBuild } from "#/user/presentation/user-router.ts";

const userLayer = Layer.mergeAll(userRepoLayer, userNotifierLayer);

export const userModule: {
	layer: typeof userLayer;
	routerBuild: typeof userRouterBuild;
} = {
	layer: userLayer,
	routerBuild: userRouterBuild,
};
