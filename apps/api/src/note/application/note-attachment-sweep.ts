import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import { match } from "ts-pattern";
import {
	NoteAttachmentRepo,
	type TNoteAttachmentRepoId,
} from "#/note/domain/note-attachment.ts";
import {
	NOTE_ATTACHMENT_REAP_RETRY_MS,
	NoteAttachmentStore,
	type TNoteAttachmentStoreId,
} from "#/note/domain/note-attachment-store.ts";
import { ERROR_TAG } from "#/shared/error-tags.ts";
import type { EDatabase, EStorage } from "#/shared/errors.ts";

export type TNoteAttachmentSweepFailure = {
	storageKey: string;
	cause: EStorage;
};

export type TNoteAttachmentSweepReport = {
	removed: number;
	failed: readonly TNoteAttachmentSweepFailure[];
};

type TSweepServices = TNoteAttachmentRepoId | TNoteAttachmentStoreId;

type TKeyOutcome = TNoteAttachmentSweepFailure | null;

const EMPTY_REPORT: TNoteAttachmentSweepReport = { removed: 0, failed: [] };

const keySweep = (
	storageKey: string,
): Effect.Effect<TKeyOutcome, EDatabase, TSweepServices> =>
	Effect.gen(function* () {
		const attachmentRepo = yield* NoteAttachmentRepo;
		const store = yield* NoteAttachmentStore;

		return yield* store.remove(storageKey).pipe(
			Effect.flatMap(() => attachmentRepo.reapDone(storageKey)),
			Effect.map((): TKeyOutcome => null),
			Effect.catchTag(ERROR_TAG.STORAGE, (cause) =>
				attachmentRepo
					.reapDefer(storageKey, NOTE_ATTACHMENT_REAP_RETRY_MS)
					.pipe(Effect.map((): TKeyOutcome => ({ storageKey, cause }))),
			),
		);
	});

const sweepFrom = (
	limit: number,
	report: TNoteAttachmentSweepReport,
): Effect.Effect<TNoteAttachmentSweepReport, EDatabase, TSweepServices> =>
	Effect.gen(function* () {
		const attachmentRepo = yield* NoteAttachmentRepo;
		const keys = yield* attachmentRepo.reapDue(limit);
		const outcomes = yield* Effect.forEach(keys, keySweep);
		const failed = A.filter(
			outcomes,
			(outcome): outcome is TNoteAttachmentSweepFailure => outcome !== null,
		);
		const next: TNoteAttachmentSweepReport = {
			removed: report.removed + keys.length - failed.length,
			failed: A.concat(report.failed, failed),
		};

		return yield* match(keys.length < limit)
			.with(
				true,
				(): Effect.Effect<
					TNoteAttachmentSweepReport,
					EDatabase,
					TSweepServices
				> => Effect.succeed(next),
			)
			.otherwise(
				(): Effect.Effect<
					TNoteAttachmentSweepReport,
					EDatabase,
					TSweepServices
				> => sweepFrom(limit, next),
			);
	});

export const noteAttachmentSweep = Effect.fn("noteAttachmentSweep")(function* (
	limit: number,
): Effect.fn.Return<TNoteAttachmentSweepReport, EDatabase, TSweepServices> {
	return yield* sweepFrom(limit, EMPTY_REPORT);
});
