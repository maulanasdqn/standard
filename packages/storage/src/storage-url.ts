import { match, P } from "ts-pattern";

const SIGNED_QUERY = {
	EXPIRES: "X-Amz-Expires",
	RESPONSE_CONTENT_TYPE: "response-content-type",
	RESPONSE_CONTENT_DISPOSITION: "response-content-disposition",
} as const;

export const STORAGE_CONTENT_DISPOSITION = {
	INLINE: "inline",
	ATTACHMENT: "attachment",
} as const;

export type TStorageContentDisposition =
	(typeof STORAGE_CONTENT_DISPOSITION)[keyof typeof STORAGE_CONTENT_DISPOSITION];

export type TStorageResponseHeaders = {
	contentType?: string;
	contentDisposition?: TStorageContentDisposition;
};

export const objectUrlAt = (
	endpoint: string,
	bucket: string,
	key: string,
): string => `${endpoint}/${bucket}/${key}`;

const queryOptionalSet = (
	url: URL,
	name: string,
	value: string | undefined,
): void =>
	match(value)
		.with(P.string, (found): void => url.searchParams.set(name, found))
		.otherwise((): void => undefined);

export const storageSignedUrlBuild = (
	objectUrl: string,
	expiresInSeconds: number,
	responseHeaders: TStorageResponseHeaders,
): URL => {
	const url = new URL(objectUrl);
	url.searchParams.set(SIGNED_QUERY.EXPIRES, String(expiresInSeconds));
	queryOptionalSet(
		url,
		SIGNED_QUERY.RESPONSE_CONTENT_TYPE,
		responseHeaders.contentType,
	);
	queryOptionalSet(
		url,
		SIGNED_QUERY.RESPONSE_CONTENT_DISPOSITION,
		responseHeaders.contentDisposition,
	);
	return url;
};
