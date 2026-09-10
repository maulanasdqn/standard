import { AwsClient } from "aws4fetch";
import { match } from "ts-pattern";

export type TStorageOptions = {
	accessKeyId: string;
	secretAccessKey: string;
	bucket: string;
	endpoint: string;
	region?: string;
};

export type TStorage = {
	put: (
		key: string,
		body: Uint8Array | string,
		contentType?: string,
	) => Promise<void>;
	get: (key: string) => Promise<Uint8Array | null>;
	remove: (key: string) => Promise<void>;
	urlGet: (key: string, expiresInSeconds?: number) => Promise<string>;
};

const objectUrl = (options: TStorageOptions, key: string): string =>
	`${options.endpoint}/${options.bucket}/${key}`;

export const storageCreate = (options: TStorageOptions): TStorage => {
	const client = new AwsClient({
		accessKeyId: options.accessKeyId,
		secretAccessKey: options.secretAccessKey,
		region: options.region ?? "auto",
		service: "s3",
	});

	const put: TStorage["put"] = async (key, body, contentType) => {
		const response = await client.fetch(objectUrl(options, key), {
			method: "PUT",
			body,
			headers: contentType ? { "content-type": contentType } : undefined,
		});

		match(response.ok)
			.with(false, () => {
				throw new Error(`storage put failed for "${key}": ${response.status}`);
			})
			.otherwise(() => undefined);
	};

	const get: TStorage["get"] = async (key) => {
		const response = await client.fetch(objectUrl(options, key));

		return match(response.status)
			.with(404, () => null)
			.otherwise(async () => new Uint8Array(await response.arrayBuffer()));
	};

	const remove: TStorage["remove"] = async (key) => {
		await client.fetch(objectUrl(options, key), { method: "DELETE" });
	};

	const urlGet: TStorage["urlGet"] = async (key, expiresInSeconds = 3600) => {
		const url = new URL(objectUrl(options, key));
		url.searchParams.set("X-Amz-Expires", String(expiresInSeconds));
		const signedRequest = await client.sign(url.toString(), {
			aws: { signQuery: true },
		});
		return signedRequest.url;
	};

	return { put, get, remove, urlGet };
};
