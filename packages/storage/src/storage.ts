import { AwsClient } from "aws4fetch";
import { match, P } from "ts-pattern";
import {
	type TStorageLimits,
	type TStorageRejectionError,
	storagePutRejection,
	storageReadRejection,
} from "./storage-limits.ts";

export const STORAGE_TIMEOUT_MS = 10_000;
export const STORAGE_URL_EXPIRY_SECONDS = 3_600;

const HTTP_METHOD = {
	PUT: "PUT",
	DELETE: "DELETE",
} as const;

const HTTP_STATUS = {
	NOT_FOUND: 404,
} as const;

const CONTENT_TYPE_HEADER = "content-type";
const CONTENT_LENGTH_HEADER = "content-length";

export type TStorageOptions = {
	accessKeyId: string;
	secretAccessKey: string;
	bucket: string;
	endpoint: string;
	maxBytes: number;
	allowedContentTypes: readonly string[];
	region?: string;
	timeoutMs?: number;
};

export type TStorage = {
	put: (
		key: string,
		body: Uint8Array | string,
		contentType: string,
	) => Promise<void>;
	get: (key: string) => Promise<Uint8Array | null>;
	remove: (key: string) => Promise<void>;
	getUrl: (key: string, expiresInSeconds?: number) => Promise<string>;
};

const objectUrl = (options: TStorageOptions, key: string): string =>
	`${options.endpoint}/${options.bucket}/${key}`;

const failedOn = (action: string, key: string, status: number): Error =>
	new Error(`storage ${action} failed for "${key}": ${status}`);

const rejectionThrow = (rejection: TStorageRejectionError | null): void =>
	match(rejection)
		.with(P.nonNullable, (found): void => {
			throw found;
		})
		.otherwise((): void => undefined);

const declaredByteLength = (response: Response): number =>
	Number(response.headers.get(CONTENT_LENGTH_HEADER) ?? 0);

export const storageCreate = (options: TStorageOptions): TStorage => {
	const client = new AwsClient({
		accessKeyId: options.accessKeyId,
		secretAccessKey: options.secretAccessKey,
		region: options.region ?? "auto",
		service: "s3",
	});

	const timeoutMs = options.timeoutMs ?? STORAGE_TIMEOUT_MS;

	const limits: TStorageLimits = {
		maxBytes: options.maxBytes,
		allowedContentTypes: options.allowedContentTypes,
	};

	const signal = (): AbortSignal => AbortSignal.timeout(timeoutMs);

	const put: TStorage["put"] = async (key, body, contentType) => {
		rejectionThrow(storagePutRejection(limits, key, body, contentType));

		const response = await client.fetch(objectUrl(options, key), {
			method: HTTP_METHOD.PUT,
			body,
			headers: { [CONTENT_TYPE_HEADER]: contentType },
			signal: signal(),
		});

		match(response.ok)
			.with(false, (): void => {
				throw failedOn("put", key, response.status);
			})
			.otherwise((): void => undefined);
	};

	const get: TStorage["get"] = async (key) => {
		const response = await client.fetch(objectUrl(options, key), {
			signal: signal(),
		});

		return match(response)
			.with(
				{ status: HTTP_STATUS.NOT_FOUND },
				async (): Promise<Uint8Array | null> => null,
			)
			.with({ ok: false }, (found): Promise<Uint8Array | null> => {
				throw failedOn("get", key, found.status);
			})
			.otherwise(async (found): Promise<Uint8Array | null> => {
				rejectionThrow(
					storageReadRejection(limits, key, declaredByteLength(found)),
				);
				const bytes = new Uint8Array(await found.arrayBuffer());
				rejectionThrow(storageReadRejection(limits, key, bytes.byteLength));
				return bytes;
			});
	};

	const remove: TStorage["remove"] = async (key) => {
		const response = await client.fetch(objectUrl(options, key), {
			method: HTTP_METHOD.DELETE,
			signal: signal(),
		});

		match(response)
			.with({ status: HTTP_STATUS.NOT_FOUND }, (): void => undefined)
			.with({ ok: false }, (found): void => {
				throw failedOn("remove", key, found.status);
			})
			.otherwise((): void => undefined);
	};

	const getUrl: TStorage["getUrl"] = async (
		key,
		expiresInSeconds = STORAGE_URL_EXPIRY_SECONDS,
	) => {
		const url = new URL(objectUrl(options, key));
		url.searchParams.set("X-Amz-Expires", String(expiresInSeconds));
		const signedRequest = await client.sign(url.toString(), {
			aws: { signQuery: true },
		});
		return signedRequest.url;
	};

	return { put, get, remove, getUrl };
};
