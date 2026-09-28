import { A } from "@mobily/ts-belt";
import { and, asc, eq, lt, notExists, sql } from "drizzle-orm";
import { Effect } from "effect";
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
	"reapClaim" | "reapRelease" | "reapDue" | "reapDefer" | "reapDone"
>;

const ONE_CLAIM = 1;

const databaseNowPlus = (delayMs: number): ReturnType<typeof sql> =>
	sql`now() + ${delayMs} * interval '1 millisecond'`;

export const reapQueriesCreate = (db: TDb): TNoteAttachmentReapQueries => {
	const reapAt = (
		storageKey: string,
		delayMs: number,
	): Effect.Effect<void, EDatabase> =>
		Effect.tryPromise({
			try: async (): Promise<void> => {
				await dbActive(db)
					.insert(noteAttachmentReap)
					.values({ storageKey, reapAfter: databaseNowPlus(delayMs) })
					.onConflictDoUpdate({
						target: noteAttachmentReap.storageKey,
						set: { reapAfter: databaseNowPlus(delayMs) },
					});
			},
			catch: (cause) => new EDatabase({ cause }),
		});

	const reapClaim: TNoteAttachmentRepo["reapClaim"] = reapAt;

	const reapDefer: TNoteAttachmentRepo["reapDefer"] = reapAt;

	const reapRelease: TNoteAttachmentRepo["reapRelease"] = (storageKey) =>
		Effect.tryPromise({
			try: async (): Promise<boolean> => {
				const rows = await dbActive(db)
					.delete(noteAttachmentReap)
					.where(eq(noteAttachmentReap.storageKey, storageKey))
					.returning({ id: noteAttachmentReap.id });
				return rows.length === ONE_CLAIM;
			},
			catch: (cause) => new EDatabase({ cause }),
		});

	const reapDue: TNoteAttachmentRepo["reapDue"] = (limit) =>
		Effect.tryPromise({
			try: async (): Promise<readonly string[]> => {
				const rows = await dbActive(db)
					.select({ storageKey: noteAttachmentReap.storageKey })
					.from(noteAttachmentReap)
					.where(
						and(
							lt(noteAttachmentReap.reapAfter, sql`now()`),
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
					.orderBy(asc(noteAttachmentReap.reapAfter))
					.limit(limit);

				return A.map(rows, (row) => row.storageKey);
			},
			catch: (cause) => new EDatabase({ cause }),
		});

	const reapDone: TNoteAttachmentRepo["reapDone"] = (storageKey) =>
		Effect.tryPromise({
			try: async (): Promise<void> => {
				await dbActive(db)
					.delete(noteAttachmentReap)
					.where(eq(noteAttachmentReap.storageKey, storageKey));
			},
			catch: (cause) => new EDatabase({ cause }),
		});

	return { reapClaim, reapRelease, reapDue, reapDefer, reapDone };
};
