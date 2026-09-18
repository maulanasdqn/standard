import { NOTE_MESSAGE } from "@app/messages";
import type {
	TNoteAttachmentList,
	TNoteAttachmentListInput,
} from "@app/schemas";
import { Effect } from "effect";
import { toNoteAttachmentDto } from "#/note/application/to-note-attachment-dto.ts";
import {
	NoteAttachmentRepo,
	type TNoteAttachmentRepoId,
} from "#/note/domain/note-attachment.ts";
import {
	NoteAttachmentStore,
	type TNoteAttachmentStoreId,
} from "#/note/domain/note-attachment-store.ts";
import { NoteRepo, type TNoteRepoId } from "#/note/domain/note.ts";
import type { TOwnershipActor } from "#/shared/authorization/owned-entity.ts";
import { ENotFound, type EDatabase, type EStorage } from "#/shared/errors.ts";

export const noteAttachmentList = Effect.fn("noteAttachmentList")(function* (
	{ noteId }: TNoteAttachmentListInput,
	actor: TOwnershipActor,
): Effect.fn.Return<
	TNoteAttachmentList,
	ENotFound | EDatabase | EStorage,
	TNoteRepoId | TNoteAttachmentRepoId | TNoteAttachmentStoreId
> {
	const noteRepo = yield* NoteRepo;
	const attachmentRepo = yield* NoteAttachmentRepo;
	const store = yield* NoteAttachmentStore;

	const note = yield* noteRepo.findById(noteId, actor);

	if (note === null) {
		return yield* new ENotFound({ message: NOTE_MESSAGE.NOT_FOUND });
	}

	const rows = yield* attachmentRepo.listByNote(noteId);

	return yield* Effect.forEach(rows, (row) =>
		store
			.url(row.storageKey)
			.pipe(Effect.map((url) => toNoteAttachmentDto(row, url))),
	);
});
