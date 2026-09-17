export const HTTP_STATUS = {
	OK: 200,
	TOO_MANY_REQUESTS: 429,
	SERVICE_UNAVAILABLE: 503,
} as const;

export type THttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
