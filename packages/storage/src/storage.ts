import { AwsClient } from "aws4fetch";
import { match } from "ts-pattern";

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

export type TStorageOptions = {
	accessKeyId: string;
	secretAccessKey: string;
	bucket: string;
	endpoint: string;
	region?: string;
	timeoutMs?: number;
};

export type TStorage = {
	put: (
		key: string,
		body: Uint8Array | string,
		contentType?: string,
	) => Promise<void>;
	get: (key: string) => Promise<Uint8Array | null>;
	remove: (key: string) => Promise<void>;
	getUrl: (key: string, expiresInSeconds?: number) => Promise<string>;
};

const objectUrl = (options: TStorageOptions, key: string): string =>
	`${options.endpoint}/${options.bucket}/${key}`;

const failedOn = (action: string, key: string, status: number): Error =>
	new Error(`storage ${action} failed for "${key}": ${status}`);

export const storageCreate = (options: TStorageOptions): TStorage => {
	const client = new AwsClient({
		accessKeyId: options.accessKeyId,
		secretAccessKey: options.secretAccessKey,
		region: options.region ?? "auto",
		service: "s3",
	});

	const timeoutMs = options.timeoutMs ?? STORAGE_TIMEOUT_MS;

	const signal = (): AbortSignal => AbortSignal.timeout(timeoutMs);

	const put: TStorage["put"] = async (key, body, contentType) => {
		const response = await client.fetch(objectUrl(options, key), {
			method: HTTP_METHOD.PUT,
			body,
			headers: contentType ? { [CONTENT_TYPE_HEADER]: contentType } : undefined,
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
			.otherwise(
				async (found): Promise<Uint8Array | null> =>
					new Uint8Array(await found.arrayBuffer()),
			);
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
