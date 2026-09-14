import { userRepoLayer } from "#/user/infrastructure/user-repository.ts";
import { userRouterBuild } from "#/user/presentation/user-router.ts";

export const userModule = {
	layer: userRepoLayer,
	routerBuild: userRouterBuild,
};
