import { D } from "@mobily/ts-belt";
import { and, count, eq, type SQL } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { match, P } from "ts-pattern";
import { EDatabase } from "#/shared/errors.ts";
import { NoteRepo, type TNoteRepo, type TNoteRow } from "#/note/domain/note.ts";
import { offsetFor, orderFor } from "#/shared/pagination.ts";
import { NOTE_SORT, type TNoteSort } from "@app/schemas";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { DbService, dbServiceLayer } from "#/platform/db/db-service.ts";
import { dbActive } from "#/platform/db/transaction.ts";
import { ownershipWhere } from "#/platform/db/ownership.ts";
import { containsWhere } from "#/platform/db/search.ts";
import { note } from "#/platform/db/tables/note.ts";

const VERSION_STEP = 1;

const SORT_COLUMN: Record<TNoteSort, AnyPgColumn> = {
	[NOTE_SORT.TITLE]: note.title,
	[NOTE_SORT.CREATED_AT]: note.createdAt,
	[NOTE_SORT.UPDATED_AT]: note.updatedAt,
};

const searchWhere = (search: string | undefined): SQL | undefined =>
	match(search)
		.with(P.nonNullable, (value) => containsWhere(note.title, value))
		.otherwise(() => undefined);

export const noteRepoLayer = Layer.effect(
	NoteRepo,
	Effect.gen(function* () {
		const { db } = yield* DbService;

		const list: TNoteRepo["list"] = (
			{ page, pageSize, search, sortBy, sortDir },
			actor,
		) => {
			const where = and(
				ownershipWhere(actor, note.authorId),
				searchWhere(search),
			);

			return Effect.tryPromise({
				try: async () => {
					const [items, [{ value: total }]] = await Promise.all([
						dbActive(db)
							.select()
							.from(note)
							.where(where)
							.limit(pageSize)
							.offset(offsetFor({ page, pageSize }))
							.orderBy(orderFor(SORT_COLUMN[sortBy], sortDir)),
						dbActive(db).select({ value: count() }).from(note).where(where),
					]);
					return { items, total };
				},
				catch: (cause) => new EDatabase({ cause }),
			});
		};

		const findById: TNoteRepo["findById"] = (id: string, actor) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.select()
						.from(note)
						.where(and(eq(note.id, id), ownershipWhere(actor, note.authorId)))
						.limit(1);
					return row ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const create: TNoteRepo["create"] = ({ title, body }, authorId) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.insert(note)
						.values({ title, body, authorId })
						.returning();
					return row as TNoteRow;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const update: TNoteRepo["update"] = ({ id, version, ...patch }, actor) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.update(note)
						.set(
							D.merge(patch, {
								updatedAt: new Date(),
								version: version + VERSION_STEP,
							}),
						)
						.where(
							and(
								eq(note.id, id),
								eq(note.version, version),
								ownershipWhere(actor, note.authorId),
							),
						)
						.returning();
					return row ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const remove: TNoteRepo["remove"] = (id: string, actor) =>
			Effect.tryPromise({
				try: async () => {
					const result = await dbActive(db)
						.delete(note)
						.where(and(eq(note.id, id), ownershipWhere(actor, note.authorId)))
						.returning({ id: note.id });
					return result.length > 0;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		return NoteRepo.of({
			list,
			findById,
			create,
			update,
			remove,
		});
	}),
).pipe(Layer.provide(dbServiceLayer));
