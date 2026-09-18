import { count, desc, eq } from "drizzle-orm";
import { Effect, Layer } from "effect";
import {
	NoteAttachmentRepo,
	type TNoteAttachmentRepo,
	type TNoteAttachmentRow,
} from "#/note/domain/note-attachment.ts";
import { reapQueriesCreate } from "#/note/infrastructure/note-attachment-reap-queries.ts";
import { DbService, dbServiceLayer } from "#/platform/db/db-service.ts";
import { noteAttachment } from "#/platform/db/tables/note-attachment.ts";
import { dbActive } from "#/platform/db/transaction.ts";
import { EDatabase } from "#/shared/errors.ts";

export const noteAttachmentRepoLayer = Layer.effect(
	NoteAttachmentRepo,
	Effect.gen(function* () {
		const { db } = yield* DbService;

		const listByNote: TNoteAttachmentRepo["listByNote"] = (noteId) =>
			Effect.tryPromise({
				try: async (): Promise<readonly TNoteAttachmentRow[]> =>
					await dbActive(db)
						.select()
						.from(noteAttachment)
						.where(eq(noteAttachment.noteId, noteId))
						.orderBy(desc(noteAttachment.createdAt)),
				catch: (cause) => new EDatabase({ cause }),
			});

		const countByNote: TNoteAttachmentRepo["countByNote"] = (noteId) =>
			Effect.tryPromise({
				try: async (): Promise<number> => {
					const [row] = await dbActive(db)
						.select({ value: count() })
						.from(noteAttachment)
						.where(eq(noteAttachment.noteId, noteId));
					return row?.value ?? 0;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const findById: TNoteAttachmentRepo["findById"] = (id) =>
			Effect.tryPromise({
				try: async (): Promise<TNoteAttachmentRow | null> => {
					const [row] = await dbActive(db)
						.select()
						.from(noteAttachment)
						.where(eq(noteAttachment.id, id))
						.limit(1);
					return row ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const create: TNoteAttachmentRepo["create"] = (draft) =>
			Effect.tryPromise({
				try: async (): Promise<TNoteAttachmentRow> => {
					const [row] = await dbActive(db)
						.insert(noteAttachment)
						.values(draft)
						.returning();
					return row as TNoteAttachmentRow;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		const remove: TNoteAttachmentRepo["remove"] = (id) =>
			Effect.tryPromise({
				try: async (): Promise<boolean> => {
					const rows = await dbActive(db)
						.delete(noteAttachment)
						.where(eq(noteAttachment.id, id))
						.returning({ id: noteAttachment.id });
					return rows.length > 0;
				},
				catch: (cause) => new EDatabase({ cause }),
			});

		return NoteAttachmentRepo.of({
			listByNote,
			countByNote,
			findById,
			create,
			remove,
			...reapQueriesCreate(db),
		});
	}),
).pipe(Layer.provide(dbServiceLayer));
