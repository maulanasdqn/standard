import type { ReactElement } from "react";
import { match, P } from "ts-pattern";

type TErrorMap = Partial<Record<string, ReadonlyArray<unknown>>>;

type TFieldErrorProps = {
	errors?: ReadonlyArray<unknown>;
	errorMap?: TErrorMap;
};

const resolve = ({
	errors,
	errorMap,
}: TFieldErrorProps): unknown | undefined => {
	if (errorMap) {
		return errorMap.onBlur?.[0] ?? errorMap.onSubmit?.[0];
	}
	return errors?.[0];
};

export const hasFieldError = (errorMap: TErrorMap): boolean =>
	(errorMap.onBlur?.length ?? 0) > 0 || (errorMap.onSubmit?.length ?? 0) > 0;

export const FieldError = (props: TFieldErrorProps): ReactElement | null =>
	match(resolve(props))
		.with({ message: P.string }, (issue) => (
			<p role="alert" className="text-xs text-destructive">
				{issue.message}
			</p>
		))
		.otherwise(() => null);
