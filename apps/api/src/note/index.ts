import { noteRepoLayer } from "#/note/infrastructure/note-repository.ts";
import { noteRouterBuild } from "#/note/presentation/note-router.ts";

export const noteModule: {
	layer: typeof noteRepoLayer;
	routerBuild: typeof noteRouterBuild;
} = {
	layer: noteRepoLayer,
	routerBuild: noteRouterBuild,
};
