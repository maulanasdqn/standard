import { Effect } from "effect";
import {
	NoteAttachmentRepo,
	type TNoteAttachmentRepoId,
} from "#/note/domain/note-attachment.ts";
import {
	NoteAttachmentStore,
	type TNoteAttachmentStoreId,
} from "#/note/domain/note-attachment-store.ts";
import type { EDatabase, EStorage } from "#/shared/errors.ts";

export const noteAttachmentSweep = Effect.fn("noteAttachmentSweep")(function* (
	limit: number,
): Effect.fn.Return<
	number,
	EDatabase | EStorage,
	TNoteAttachmentRepoId | TNoteAttachmentStoreId
> {
	const attachmentRepo = yield* NoteAttachmentRepo;
	const store = yield* NoteAttachmentStore;

	const keys = yield* attachmentRepo.reapDue(new Date(), limit);

	yield* Effect.forEach(keys, (storageKey) =>
		store
			.remove(storageKey)
			.pipe(Effect.flatMap(() => attachmentRepo.reapDone(storageKey))),
	);

	return keys.length;
});
