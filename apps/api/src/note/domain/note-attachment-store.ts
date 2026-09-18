import { Context, type Effect } from "effect";
import type { EBadRequest, EStorage } from "#/shared/errors.ts";
import { REPO_TAG } from "#/shared/repo-tags.ts";
import type { TServiceId } from "#/shared/service-id.ts";

export const NOTE_ATTACHMENT_REAP_GRACE_MS = 3_600_000;

export type TNoteAttachmentStore = {
	put: (
		storageKey: string,
		body: Uint8Array<ArrayBuffer>,
		contentType: string,
	) => Effect.Effect<void, EStorage | EBadRequest>;
	remove: (storageKey: string) => Effect.Effect<void, EStorage>;
	url: (storageKey: string) => Effect.Effect<string, EStorage>;
};

export type TNoteAttachmentStoreId = TServiceId<
	typeof REPO_TAG.NOTE_ATTACHMENT_STORE
>;

export const NoteAttachmentStore = Context.Service<
	TNoteAttachmentStoreId,
	TNoteAttachmentStore
>(REPO_TAG.NOTE_ATTACHMENT_STORE);
