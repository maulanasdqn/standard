import type { Effect } from "effect";
import type { EDatabase } from "#/application/shared/errors.ts";

export type INoteRow = {
	id: string;
	title: string;
	body: string;
	authorId: string;
	createdAt: Date;
	updatedAt: Date;
};

export type INoteQuery = {
	page: number;
	pageSize: number;
	search?: string;
};

export type INoteRepo = {
	list: (
		query: INoteQuery,
	) => Effect.Effect<{ items: INoteRow[]; total: number }, EDatabase>;
	findById: (id: string) => Effect.Effect<INoteRow | null, EDatabase>;
	create: (input: {
		title: string;
		body: string;
		authorId: string;
	}) => Effect.Effect<INoteRow, EDatabase>;
	update: (
		id: string,
		input: { title?: string; body?: string },
	) => Effect.Effect<INoteRow | null, EDatabase>;
	remove: (id: string) => Effect.Effect<boolean, EDatabase>;
};
