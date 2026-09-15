import type {
	TNoteCreateInput,
	TNoteListInput,
	TNoteUpdateInput,
} from "@app/schemas";
import { Context, type Effect } from "effect";
import type { TBaseRow } from "#/shared/base-row.ts";
import type { EDatabase } from "#/shared/errors.ts";
import type { TRowPage } from "#/shared/pagination.ts";
import type { TServiceId } from "#/shared/service-id.ts";
import { REPO_TAG } from "#/shared/repo-tags.ts";
import type {
	TOwnedEntity,
	TOwnershipActor,
} from "#/shared/authorization/owned-entity.ts";

export type TNoteRow = TBaseRow &
	TOwnedEntity & {
		title: string;
		body: string;
		authorId: string;
	};

export type TNoteRepo = {
	list: (
		input: TNoteListInput,
		actor: TOwnershipActor,
	) => Effect.Effect<TRowPage<TNoteRow>, EDatabase>;
	findById: (
		id: string,
		actor: TOwnershipActor,
	) => Effect.Effect<TNoteRow | null, EDatabase>;
	create: (
		input: TNoteCreateInput,
		authorId: string,
	) => Effect.Effect<TNoteRow, EDatabase>;
	update: (
		input: TNoteUpdateInput,
		actor: TOwnershipActor,
	) => Effect.Effect<TNoteRow | null, EDatabase>;
	remove: (
		id: string,
		actor: TOwnershipActor,
	) => Effect.Effect<boolean, EDatabase>;
};

export type TNoteRepoId = TServiceId<typeof REPO_TAG.NOTE>;

export const NoteRepo = Context.Service<TNoteRepoId, TNoteRepo>(REPO_TAG.NOTE);
