import {
	STORAGE_IMAGE_CONTENT_TYPES,
	storageCreate,
	type TStorage,
} from "@app/storage";
import { Context, Effect, Layer } from "effect";
import { env } from "#/platform/config/env.ts";
import { SERVICE_TAG } from "#/platform/service-tags.ts";
import type { TServiceId } from "#/shared/service-id.ts";

export type TStorageService = { readonly storage: TStorage };

export type TStorageServiceId = TServiceId<typeof SERVICE_TAG.STORAGE>;

export const StorageService = Context.Service<
	TStorageServiceId,
	TStorageService
>(SERVICE_TAG.STORAGE);

export const storageServiceLayer = Layer.effect(
	StorageService,
	Effect.sync(() =>
		StorageService.of({
			storage: storageCreate({
				endpoint: env.STORAGE_ENDPOINT,
				bucket: env.STORAGE_BUCKET,
				accessKeyId: env.STORAGE_ACCESS_KEY_ID,
				secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
				region: env.STORAGE_REGION,
				maxBytes: env.STORAGE_MAX_BYTES,
				allowedContentTypes: STORAGE_IMAGE_CONTENT_TYPES,
			}),
		}),
	),
);
