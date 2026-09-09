import { D } from "@mobily/ts-belt";
import { count, eq, ilike, type SQL } from "drizzle-orm";
import { match, P } from "ts-pattern";
import type { INoteQuery, INoteRepo, INoteRow } from "#/domain/note/note.ts";
import { offsetFor } from "#/domain/shared/pagination.ts";
import type { TDb } from "#/infrastructure/db/client.ts";
import { note } from "#/infrastructure/db/schema/note.ts";

const searchWhere = (search: string | undefined): SQL | undefined =>
	match(search)
		.with(P.nonNullable, (value) => ilike(note.title, `%${value}%`))
		.otherwise(() => undefined);

export const createNoteRepository = (db: TDb): INoteRepo => ({
	list: async ({
		page,
		pageSize,
		search,
	}: INoteQuery): Promise<{ items: INoteRow[]; total: number }> => {
		const where = searchWhere(search);

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

	findById: async (id: string): Promise<INoteRow | null> => {
		const [row] = await db.select().from(note).where(eq(note.id, id)).limit(1);
		return row ?? null;
	},

	create: async ({ title, body, authorId }): Promise<INoteRow> => {
		const [row] = await db
			.insert(note)
			.values({ title, body, authorId })
			.returning();
		return row as INoteRow;
	},

	update: async (id, input): Promise<INoteRow | null> => {
		const [row] = await db
			.update(note)
			.set(D.merge(input, { updatedAt: new Date() }))
			.where(eq(note.id, id))
			.returning();
		return row ?? null;
	},

	remove: async (id: string): Promise<boolean> => {
		const result = await db
			.delete(note)
			.where(eq(note.id, id))
			.returning({ id: note.id });
		return result.length > 0;
	},
});
