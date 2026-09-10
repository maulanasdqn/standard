import { D } from "@mobily/ts-belt";
import { count, eq, ilike, type SQL } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import { match, P } from "ts-pattern";
import { EDatabase } from "#/application/shared/errors.ts";
import type { TNoteRepo, TNoteRow } from "#/domain/note/note.ts";
import { offsetFor } from "#/domain/shared/pagination.ts";
import { DbService } from "#/infrastructure/db/db-service.ts";
import { note } from "#/infrastructure/db/schema/note.ts";
import { SERVICE_TAG } from "#/infrastructure/service-tags.ts";

const searchWhere = (search: string | undefined): SQL | undefined =>
	match(search)
		.with(P.nonNullable, (value) => ilike(note.title, `%${value}%`))
		.otherwise(() => undefined);

export class NoteRepo extends Context.Service<NoteRepo, TNoteRepo>()(
	SERVICE_TAG.NOTE_REPO,
) {
	static readonly layer = Layer.effect(
		NoteRepo,
		Effect.gen(function* () {
			const { db } = yield* DbService;

			const list: TNoteRepo["list"] = ({ page, pageSize, search }) => {
				const where = searchWhere(search);

				return Effect.tryPromise({
					try: async () => {
						const [items, [{ value: total }]] = await Promise.all([
							db
								.select()
								.from(note)
								.where(where)
								.limit(pageSize)
								.offset(offsetFor({ page, pageSize }))
								.orderBy(note.createdAt),
							db.select({ value: count() }).from(note).where(where),
						]);
						return { items, total };
					},
					catch: (cause) => new EDatabase({ cause }),
				});
			};

			const findById: TNoteRepo["findById"] = (id: string) =>
				Effect.tryPromise({
					try: async () => {
						const [row] = await db
							.select()
							.from(note)
							.where(eq(note.id, id))
							.limit(1);
						return row ?? null;
					},
					catch: (cause) => new EDatabase({ cause }),
				});

			const create: TNoteRepo["create"] = ({ title, body }, authorId) =>
				Effect.tryPromise({
					try: async () => {
						const [row] = await db
							.insert(note)
							.values({ title, body, authorId })
							.returning();
						return row as TNoteRow;
					},
					catch: (cause) => new EDatabase({ cause }),
				});

			const update: TNoteRepo["update"] = ({ id, ...patch }) =>
				Effect.tryPromise({
					try: async () => {
						const [row] = await db
							.update(note)
							.set(D.merge(patch, { updatedAt: new Date() }))
							.where(eq(note.id, id))
							.returning();
						return row ?? null;
					},
					catch: (cause) => new EDatabase({ cause }),
				});

			const remove: TNoteRepo["remove"] = (id: string) =>
				Effect.tryPromise({
					try: async () => {
						const result = await db
							.delete(note)
							.where(eq(note.id, id))
							.returning({ id: note.id });
						return result.length > 0;
					},
					catch: (cause) => new EDatabase({ cause }),
				});

			return NoteRepo.of({ list, findById, create, update, remove });
		}),
	).pipe(Layer.provide(DbService.layer));
}
