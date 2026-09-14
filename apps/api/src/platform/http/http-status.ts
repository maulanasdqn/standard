export const HTTP_STATUS = {
	TOO_MANY_REQUESTS: 429,
} as const;

export type THttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
