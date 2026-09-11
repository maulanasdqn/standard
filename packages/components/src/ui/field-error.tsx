import type { ReactElement } from "react";
import { match, P } from "ts-pattern";

type TFieldErrorProps = {
	errors: ReadonlyArray<unknown>;
};

export const FieldError = ({ errors }: TFieldErrorProps): ReactElement | null =>
	match(errors[0])
		.with({ message: P.string }, (issue) => (
			<p className="text-xs text-red-600">{issue.message}</p>
		))
		.otherwise(() => null);
