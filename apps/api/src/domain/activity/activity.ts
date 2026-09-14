import type { TActivityEntry } from "@app/activity";
import type { TActivityListInput } from "@app/schemas";
import { Context, type Effect } from "effect";
import type { EDatabase } from "#/domain/shared/errors.ts";
import type { TRowPage } from "#/domain/shared/pagination.ts";
import { REPO_TAG } from "#/domain/shared/service-tags.ts";

export type TActivityRow = {
	id: string;
	actorId: string | null;
	actorEmail: string | null;
	action: string;
	entityType: string;
	entityId: string;
	metadata: unknown;
	createdAt: Date;
};

export type TActivityRepoShape = {
	insert: (entry: TActivityEntry) => Effect.Effect<void, EDatabase>;
	list: (
		input: TActivityListInput,
	) => Effect.Effect<TRowPage<TActivityRow>, EDatabase>;
};

export class ActivityRepo extends Context.Service<
	ActivityRepo,
	TActivityRepoShape
>()(REPO_TAG.ACTIVITY) {}
