import {
	AuthService,
	authServiceLayer,
} from "#/auth/infrastructure/auth-service.ts";
import type { TAuthServiceId } from "#/auth/infrastructure/auth-service.ts";
import { meRouterBuild } from "#/auth/presentation/me-router.ts";
import { authMount } from "#/auth/presentation/mount-auth.ts";

export { AuthService, authMount };
export type { TAuthServiceId };
export type { TAuth } from "#/auth/infrastructure/better-auth.ts";

export const authModule: {
	layer: typeof authServiceLayer;
	routerBuild: typeof meRouterBuild;
} = {
	layer: authServiceLayer,
	routerBuild: meRouterBuild,
};
