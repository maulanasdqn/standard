import { Button } from "@app/components/ui/button";
import { ERROR_MESSAGE } from "@app/messages";
import {
	type ErrorComponentProps,
	useRouter,
	useRouterState,
} from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { isServerUnreachable } from "#/libs/auth/server-unreachable.ts";

type TErrorCopy = {
	title: string;
	body: string;
	next: string;
};

const UNREACHABLE_COPY: TErrorCopy = {
	title: ERROR_MESSAGE.SERVER_UNREACHABLE_TITLE,
	body: ERROR_MESSAGE.SERVER_UNREACHABLE_BODY,
	next: ERROR_MESSAGE.SERVER_UNREACHABLE_NEXT,
};

const UNEXPECTED_COPY: TErrorCopy = {
	title: ERROR_MESSAGE.UNEXPECTED_TITLE,
	body: ERROR_MESSAGE.UNEXPECTED_BODY,
	next: ERROR_MESSAGE.UNEXPECTED_NEXT,
};

const ERROR_TITLE_ID = "route-error-title";

export const RouteErrorScreen: FC<ErrorComponentProps> = (
	props,
): ReactElement => {
	const router = useRouter();
	const isRetrying = useRouterState({ select: (state) => state.isLoading });

	const copy = match(isServerUnreachable(props.error))
		.with(true, () => UNREACHABLE_COPY)
		.otherwise(() => UNEXPECTED_COPY);

	return (
		<section
			aria-labelledby={ERROR_TITLE_ID}
			className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center"
		>
			<h1 id={ERROR_TITLE_ID} className="text-2xl font-bold uppercase">
				{copy.title}
			</h1>
			<p role="alert" className="max-w-prose text-sm font-light">
				{copy.body}
			</p>
			<p className="max-w-prose text-sm font-light text-muted-foreground">
				{copy.next}
			</p>
			<Button onClick={() => void router.invalidate()} disabled={isRetrying}>
				{match(isRetrying)
					.with(true, () => ERROR_MESSAGE.RETRYING)
					.otherwise(() => ERROR_MESSAGE.RETRY)}
			</Button>
		</section>
	);
};
