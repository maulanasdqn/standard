import { isStorageRejection } from "@app/storage";
import { Effect, Layer } from "effect";
import { match } from "ts-pattern";
import {
	NoteAttachmentStore,
	type TNoteAttachmentStore,
} from "#/note/domain/note-attachment-store.ts";
import { env } from "#/platform/config/env.ts";
import {
	StorageService,
	storageServiceLayer,
} from "#/platform/storage/storage-service.ts";
import { EBadRequest, EStorage } from "#/shared/errors.ts";

const putFailure = (cause: unknown): EBadRequest | EStorage =>
	match(cause)
		.when(
			isStorageRejection,
			(rejection) => new EBadRequest({ message: rejection.message }),
		)
		.otherwise((found) => new EStorage({ cause: found }));

export const noteAttachmentStoreLayer = Layer.effect(
	NoteAttachmentStore,
	Effect.gen(function* () {
		const { storage } = yield* StorageService;

		const put: TNoteAttachmentStore["put"] = (storageKey, body, contentType) =>
			Effect.tryPromise({
				try: (): Promise<void> => storage.put(storageKey, body, contentType),
				catch: putFailure,
			});

		const remove: TNoteAttachmentStore["remove"] = (storageKey) =>
			Effect.tryPromise({
				try: (): Promise<void> => storage.remove(storageKey),
				catch: (cause) => new EStorage({ cause }),
			});

		const url: TNoteAttachmentStore["url"] = (storageKey) =>
			Effect.tryPromise({
				try: (): Promise<string> =>
					storage.getUrl(storageKey, env.STORAGE_URL_EXPIRY_SECONDS),
				catch: (cause) => new EStorage({ cause }),
			});

		return NoteAttachmentStore.of({ put, remove, url });
	}),
).pipe(Layer.provide(storageServiceLayer));
