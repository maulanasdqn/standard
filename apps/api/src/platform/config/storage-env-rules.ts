import { match } from "ts-pattern";
import { z } from "zod";

const STORAGE_ENV_KEY = {
	STORAGE_ENDPOINT: "STORAGE_ENDPOINT",
	STORAGE_PUBLIC_ENDPOINT: "STORAGE_PUBLIC_ENDPOINT",
} as const;

const STORAGE_ENV_MESSAGE = {
	BROWSER_ENDPOINT_HTTPS:
		"The storage endpoint the browser fetches from (STORAGE_PUBLIC_ENDPOINT, or STORAGE_ENDPOINT when it is unset) must be HTTPS in production.",
} as const;

const HTTPS_PROTOCOL = "https:";
const DEFAULT_REGION = "auto";
const DEFAULT_URL_EXPIRY_SECONDS = 900;

const blankAsUndefined = (value: unknown): unknown =>
	match(value)
		.with("", (): undefined => undefined)
		.otherwise((found): unknown => found);

export const storageEnvShape = {
	STORAGE_ENDPOINT: z.url(),
	STORAGE_PUBLIC_ENDPOINT: z.preprocess(blankAsUndefined, z.url().optional()),
	STORAGE_BUCKET: z.string().min(1),
	STORAGE_ACCESS_KEY_ID: z.string().min(1),
	STORAGE_SECRET_ACCESS_KEY: z.string().min(1),
	STORAGE_REGION: z.string().min(1).default(DEFAULT_REGION),
	STORAGE_URL_EXPIRY_SECONDS: z.coerce
		.number()
		.int()
		.positive()
		.default(DEFAULT_URL_EXPIRY_SECONDS),
};

type TStorageEnv = {
	STORAGE_ENDPOINT: string;
	STORAGE_PUBLIC_ENDPOINT?: string | undefined;
};

type TBrowserEndpoint = {
	url: string;
	key: (typeof STORAGE_ENV_KEY)[keyof typeof STORAGE_ENV_KEY];
};

const browserEndpointOf = (env: TStorageEnv): TBrowserEndpoint =>
	match(env.STORAGE_PUBLIC_ENDPOINT)
		.with(
			undefined,
			(): TBrowserEndpoint => ({
				url: env.STORAGE_ENDPOINT,
				key: STORAGE_ENV_KEY.STORAGE_ENDPOINT,
			}),
		)
		.otherwise(
			(url): TBrowserEndpoint => ({
				url,
				key: STORAGE_ENV_KEY.STORAGE_PUBLIC_ENDPOINT,
			}),
		);

export const storageEnvRefine = (
	env: TStorageEnv,
	context: z.RefinementCtx,
	production: boolean,
): void => {
	const browser = browserEndpointOf(env);

	match(production && new URL(browser.url).protocol !== HTTPS_PROTOCOL)
		.with(true, (): void => {
			context.addIssue({
				code: "custom",
				path: [browser.key],
				message: STORAGE_ENV_MESSAGE.BROWSER_ENDPOINT_HTTPS,
			});
		})
		.otherwise((): void => undefined);
};
