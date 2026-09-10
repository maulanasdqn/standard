import type {
	TNoteCreateInput,
	TNoteListInput,
	TNoteUpdateInput,
} from "@app/schemas";
import type { Effect } from "effect";
import type { EDatabase } from "#/application/shared/errors.ts";
import type { TRowPage } from "#/domain/shared/pagination.ts";

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
