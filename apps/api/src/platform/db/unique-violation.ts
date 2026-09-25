import { match, P } from "ts-pattern";

const UNIQUE_VIOLATION_CODE = "23505";

export const isUniqueViolation = (cause: unknown): boolean =>
	match(cause)
		.with({ code: UNIQUE_VIOLATION_CODE }, (): boolean => true)
		.with({ cause: P.nonNullable }, (wrapped): boolean =>
			isUniqueViolation(wrapped.cause),
		)
		.otherwise((): boolean => false);
