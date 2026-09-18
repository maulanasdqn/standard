import type { TNoteAttachmentContentType } from "@app/schemas";
import { Context, type Effect } from "effect";
import type { TBaseRow } from "#/shared/base-row.ts";
import type { EDatabase } from "#/shared/errors.ts";
import { REPO_TAG } from "#/shared/repo-tags.ts";
import type { TServiceId } from "#/shared/service-id.ts";

export type TNoteAttachmentRow = TBaseRow & {
	noteId: string;
	storageKey: string;
	fileName: string;
	contentType: string;
	byteSize: number;
};

export type TNoteAttachmentDraft = {
	noteId: string;
	storageKey: string;
	fileName: string;
	contentType: TNoteAttachmentContentType;
	byteSize: number;
};

export type TNoteAttachmentRepo = {
	listByNote: (
		noteId: string,
	) => Effect.Effect<readonly TNoteAttachmentRow[], EDatabase>;
	countByNote: (noteId: string) => Effect.Effect<number, EDatabase>;
	findById: (id: string) => Effect.Effect<TNoteAttachmentRow | null, EDatabase>;
	create: (
		draft: TNoteAttachmentDraft,
	) => Effect.Effect<TNoteAttachmentRow, EDatabase>;
	remove: (id: string) => Effect.Effect<boolean, EDatabase>;
	reapClaim: (
		storageKey: string,
		reapAfter: Date,
	) => Effect.Effect<void, EDatabase>;
	reapClaimForNote: (
		noteId: string,
		reapAfter: Date,
	) => Effect.Effect<void, EDatabase>;
	reapRelease: (storageKey: string) => Effect.Effect<void, EDatabase>;
	reapDue: (
		now: Date,
		limit: number,
	) => Effect.Effect<readonly string[], EDatabase>;
	reapDone: (storageKey: string) => Effect.Effect<void, EDatabase>;
};

export type TNoteAttachmentRepoId = TServiceId<typeof REPO_TAG.NOTE_ATTACHMENT>;

export const NoteAttachmentRepo = Context.Service<
	TNoteAttachmentRepoId,
	TNoteAttachmentRepo
>(REPO_TAG.NOTE_ATTACHMENT);
