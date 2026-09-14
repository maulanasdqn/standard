import type { TActivityEntry } from "@app/activity";
import type { TActivityListInput } from "@app/schemas";
import { Context, type Effect } from "effect";
import type { TBaseEventRow } from "#/domain/shared/base-row.ts";
import type { EDatabase } from "#/domain/shared/errors.ts";
import type { TRowPage } from "#/domain/shared/pagination.ts";
import type { TServiceId } from "#/domain/shared/service-id.ts";
import { REPO_TAG } from "#/domain/shared/service-tags.ts";

export type TActivityRow = TBaseEventRow & {
	actorId: string | null;
	actorEmail: string | null;
	action: string;
	resourceType: string;
	resourceId: string;
	metadata: unknown;
};

export type TActivityRepoShape = {
	insert: (entry: TActivityEntry) => Effect.Effect<void, EDatabase>;
	list: (
		input: TActivityListInput,
	) => Effect.Effect<TRowPage<TActivityRow>, EDatabase>;
};

export type TActivityRepoId = TServiceId<typeof REPO_TAG.ACTIVITY>;

export const ActivityRepo = Context.Service<
	TActivityRepoId,
	TActivityRepoShape
>(REPO_TAG.ACTIVITY);
