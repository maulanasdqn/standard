import type {
	TNoteCreateInput,
	TNoteListInput,
	TNoteUpdateInput,
} from "@app/schemas";
import { Context, type Effect } from "effect";
import type { EDatabase } from "#/domain/shared/errors.ts";
import type { TRowPage } from "#/domain/shared/pagination.ts";
import { REPO_TAG } from "#/domain/shared/service-tags.ts";

export type TNoteRow = {
	id: string;
	title: string;
	body: string;
	authorId: string;
	createdAt: Date;
	updatedAt: Date;
};

export type TNoteRepo = {
	list: (input: TNoteListInput) => Effect.Effect<TRowPage<TNoteRow>, EDatabase>;
	findById: (id: string) => Effect.Effect<TNoteRow | null, EDatabase>;
	create: (
		input: TNoteCreateInput,
		authorId: string,
	) => Effect.Effect<TNoteRow, EDatabase>;
	update: (
		input: TNoteUpdateInput,
	) => Effect.Effect<TNoteRow | null, EDatabase>;
	remove: (id: string) => Effect.Effect<boolean, EDatabase>;
};

export class NoteRepo extends Context.Service<NoteRepo, TNoteRepo>()(
	REPO_TAG.NOTE,
) {}
