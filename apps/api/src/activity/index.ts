import { ActivityRepo } from "#/activity/domain/activity.ts";
import type { TActivityRepoId } from "#/activity/domain/activity.ts";
import {
	activityRecorderLayer,
	activityRepoLayer,
} from "#/activity/infrastructure/activity-repository.ts";
import { activityRouterBuild } from "#/activity/presentation/activity-router.ts";
import { Layer } from "effect";

export { ActivityRepo, activityRecorderLayer, activityRepoLayer };
export type { TActivityRepoId };

export const activityModule = {
	layer: Layer.mergeAll(activityRecorderLayer, activityRepoLayer),
	routerBuild: activityRouterBuild,
};
