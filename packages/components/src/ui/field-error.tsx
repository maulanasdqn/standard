import { AnimatePresence, motion } from "motion/react";
import type { FC, ReactElement } from "react";
import { match, P } from "ts-pattern";
import { MOTION_DURATION } from "../motion/motion-tokens.ts";

type TErrorMap = Partial<Record<string, unknown>>;

type TFieldErrorProps = {
	errors?: ReadonlyArray<unknown>;
	errorMap?: TErrorMap;
};

const firstIssue = (value: unknown): unknown =>
	match(value)
		.with(P.array(), (issues) => issues[0])
		.otherwise(() => undefined);

const resolve = (props: TFieldErrorProps): unknown =>
	match(props.errorMap)
		.with(P.nullish, () => firstIssue(props.errors))
		.otherwise((errorMap) =>
			match(firstIssue(errorMap.onBlur))
				.with(P.nullish, () => firstIssue(errorMap.onSubmit))
				.otherwise((issue) => issue),
		);

export const hasFieldError = (errorMap: TErrorMap): boolean =>
	firstIssue(errorMap.onBlur) !== undefined ||
	firstIssue(errorMap.onSubmit) !== undefined;

const issueMessage = (issue: unknown): string | undefined =>
	match(issue)
		.with({ message: P.string }, (found) => found.message)
		.otherwise(() => undefined);

export const FieldError: FC<TFieldErrorProps> = (props): ReactElement => {
	const message = issueMessage(resolve(props));

	return (
		<AnimatePresence initial={false}>
			{message !== undefined && (
				<motion.p
					key={message}
					role="alert"
					className="text-xs text-destructive"
					initial={{ opacity: 0, y: -4, x: -2 }}
					animate={{ opacity: 1, y: 0, x: [0, -3, 3, -2, 0] }}
					exit={{ opacity: 0, y: -4 }}
					transition={{ duration: MOTION_DURATION.BASE }}
				>
					{message}
				</motion.p>
			)}
		</AnimatePresence>
	);
};
