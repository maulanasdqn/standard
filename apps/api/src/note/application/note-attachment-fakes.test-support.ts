import { NOTE_ATTACHMENT_CONTENT_TYPE } from "@app/schemas";
import { Effect, Layer } from "effect";
import { type Mock, vi } from "vitest";
import {
	NoteAttachmentStore,
	type TNoteAttachmentStore,
	type TNoteAttachmentStoreId,
} from "#/note/domain/note-attachment-store.ts";
import {
	NoteAttachmentRepo,
	type TNoteAttachmentRepo,
	type TNoteAttachmentRepoId,
	type TNoteAttachmentRow,
} from "#/note/domain/note-attachment.ts";
import {
	NoteRepo,
	type TNoteRepo,
	type TNoteRepoId,
	type TNoteRow,
} from "#/note/domain/note.ts";

export const AUTHOR_ID = "22222222-2222-4222-8222-222222222222";
export const NOTE_ID = "11111111-1111-4111-8111-111111111111";
export const ATTACHMENT_ID = "33333333-3333-4333-8333-333333333333";
export const SIGNED_URL = "https://bucket.test/signed";

const AT = new Date("2026-01-01T00:00:00Z");

export const noteRow: TNoteRow = {
	id: NOTE_ID,
	title: "Title",
	body: "Body",
	authorId: AUTHOR_ID,
	version: 1,
	createdAt: AT,
	updatedAt: AT,
};

export const attachmentRow: TNoteAttachmentRow = {
	id: ATTACHMENT_ID,
	noteId: NOTE_ID,
	storageKey: `notes/${NOTE_ID}/object`,
	fileName: "pixel.png",
	contentType: NOTE_ATTACHMENT_CONTENT_TYPE.PNG,
	byteSize: 3,
	createdAt: AT,
	updatedAt: AT,
};

export const succeeding = <A>(value: A): Mock =>
	vi.fn().mockReturnValue(Effect.succeed(value));

export const noteRepoLayer = (
	overrides: Partial<TNoteRepo>,
): Layer.Layer<TNoteRepoId> =>
	Layer.succeed(
		NoteRepo,
		NoteRepo.of({
			list: vi.fn(),
			findById: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
			...overrides,
		}),
	);

export const attachmentRepoLayer = (
	overrides: Partial<TNoteAttachmentRepo>,
): Layer.Layer<TNoteAttachmentRepoId> =>
	Layer.succeed(
		NoteAttachmentRepo,
		NoteAttachmentRepo.of({
			listByNote: vi.fn(),
			countByNote: vi.fn(),
			findById: vi.fn(),
			create: vi.fn(),
			remove: vi.fn(),
			noteLock: vi.fn(),
			reapClaim: vi.fn(),
			reapRelease: vi.fn(),
			reapDue: vi.fn(),
			reapDefer: vi.fn(),
			reapDone: vi.fn(),
			...overrides,
		}),
	);

export const attachmentStoreLayer = (
	overrides: Partial<TNoteAttachmentStore>,
): Layer.Layer<TNoteAttachmentStoreId> =>
	Layer.succeed(
		NoteAttachmentStore,
		NoteAttachmentStore.of({
			put: vi.fn(),
			remove: vi.fn(),
			url: vi.fn(),
			...overrides,
		}),
	);
