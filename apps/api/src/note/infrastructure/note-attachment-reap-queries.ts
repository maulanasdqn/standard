import { A } from "@mobily/ts-belt";
import { and, eq, lt, notExists, sql } from "drizzle-orm";
import { Effect } from "effect";
import { match } from "ts-pattern";
import type { TNoteAttachmentRepo } from "#/note/domain/note-attachment.ts";
import type { TDb } from "#/platform/db/client.ts";
import {
	noteAttachment,
	noteAttachmentReap,
} from "#/platform/db/tables/note-attachment.ts";
import { dbActive } from "#/platform/db/transaction.ts";
import { EDatabase } from "#/shared/errors.ts";

export type TNoteAttachmentReapQueries = Pick<
	TNoteAttachmentRepo,
	"reapClaim" | "reapClaimForNote" | "reapRelease" | "reapDue" | "reapDone"
>;

export const reapQueriesCreate = (db: TDb): TNoteAttachmentReapQueries => {
	const reapClaim: TNoteAttachmentRepo["reapClaim"] = (storageKey, reapAfter) =>
		Effect.tryPromise({
			try: async (): Promise<void> => {
				await dbActive(db)
					.insert(noteAttachmentReap)
					.values({ storageKey, reapAfter })
					.onConflictDoUpdate({
						target: noteAttachmentReap.storageKey,
						set: { reapAfter },
					});
			},
			catch: (cause) => new EDatabase({ cause }),
		});

	const reapClaimForNote: TNoteAttachmentRepo["reapClaimForNote"] = (
		noteId,
		reapAfter,
	) =>
		Effect.tryPromise({
			try: async (): Promise<void> => {
				const rows = await dbActive(db)
					.select({ storageKey: noteAttachment.storageKey })
					.from(noteAttachment)
					.where(eq(noteAttachment.noteId, noteId));

				await match(A.isEmpty(rows))
					.with(true, async (): Promise<void> => undefined)
					.otherwise(async (): Promise<void> => {
						await dbActive(db)
							.insert(noteAttachmentReap)
							.values([
								...A.map(rows, (row) => ({
									storageKey: row.storageKey,
									reapAfter,
								})),
							])
							.onConflictDoUpdate({
								target: noteAttachmentReap.storageKey,
								set: { reapAfter },
							});
					});
			},
			catch: (cause) => new EDatabase({ cause }),
		});

	const reapRelease: TNoteAttachmentRepo["reapRelease"] = (storageKey) =>
		Effect.tryPromise({
			try: async (): Promise<void> => {
				await dbActive(db)
					.delete(noteAttachmentReap)
					.where(eq(noteAttachmentReap.storageKey, storageKey));
			},
			catch: (cause) => new EDatabase({ cause }),
		});

	const reapDue: TNoteAttachmentRepo["reapDue"] = (now, limit) =>
		Effect.tryPromise({
			try: async (): Promise<readonly string[]> => {
				const rows = await dbActive(db)
					.select({ storageKey: noteAttachmentReap.storageKey })
					.from(noteAttachmentReap)
					.where(
						and(
							lt(noteAttachmentReap.reapAfter, now),
							notExists(
								dbActive(db)
									.select({ present: sql`1` })
									.from(noteAttachment)
									.where(
										eq(
											noteAttachment.storageKey,
											noteAttachmentReap.storageKey,
										),
									),
							),
						),
					)
					.limit(limit);

				return A.map(rows, (row) => row.storageKey);
			},
			catch: (cause) => new EDatabase({ cause }),
		});

	const reapDone: TNoteAttachmentRepo["reapDone"] = (storageKey) =>
		reapRelease(storageKey);

	return { reapClaim, reapClaimForNote, reapRelease, reapDue, reapDone };
};
