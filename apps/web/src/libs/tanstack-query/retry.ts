import { A } from "@mobily/ts-belt";
import { ORPCError } from "@orpc/client";

const MAX_RETRIES = 1;

const CLIENT_ERROR = { MIN: 400, MAX: 499 } as const;

const RETRYABLE_STATUS = {
	REQUEST_TIMEOUT: 408,
	TOO_MANY_REQUESTS: 429,
} as const;

const RETRYABLE_CLIENT_STATUSES: readonly number[] = [
	RETRYABLE_STATUS.REQUEST_TIMEOUT,
	RETRYABLE_STATUS.TOO_MANY_REQUESTS,
];

const isFinalAnswer = (error: unknown): boolean =>
	error instanceof ORPCError &&
	error.status >= CLIENT_ERROR.MIN &&
	error.status <= CLIENT_ERROR.MAX &&
	!A.includes(RETRYABLE_CLIENT_STATUSES, error.status);

export const queryRetry = (failureCount: number, error: unknown): boolean =>
	failureCount < MAX_RETRIES && !isFinalAnswer(error);
