import { Stagger, StaggerItem } from "@app/components/motion/stagger";
import { Button } from "@app/components/ui/button";
import { ERROR_MESSAGE } from "@app/messages";
import {
	type ErrorComponentProps,
	Link,
	useRouter,
	useRouterState,
} from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { isForbidden } from "#/libs/auth/forbidden.ts";
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

const FORBIDDEN_COPY: TErrorCopy = {
	title: ERROR_MESSAGE.FORBIDDEN_TITLE,
	body: ERROR_MESSAGE.FORBIDDEN_BODY,
	next: ERROR_MESSAGE.FORBIDDEN_NEXT,
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

	const forbidden = isForbidden(props.error);

	const copy = match({
		forbidden,
		unreachable: isServerUnreachable(props.error),
	})
		.with({ forbidden: true }, () => FORBIDDEN_COPY)
		.with({ unreachable: true }, () => UNREACHABLE_COPY)
		.otherwise(() => UNEXPECTED_COPY);

	return (
		<section
			aria-labelledby={ERROR_TITLE_ID}
			className="flex min-h-dvh flex-col items-center justify-center p-6 text-center"
		>
			<Stagger className="flex flex-col items-center gap-4">
				<StaggerItem>
					<h1 id={ERROR_TITLE_ID} className="text-2xl font-bold uppercase">
						{copy.title}
					</h1>
				</StaggerItem>
				<StaggerItem>
					<p role="alert" className="max-w-prose text-sm font-light">
						{copy.body}
					</p>
				</StaggerItem>
				<StaggerItem>
					<p className="max-w-prose text-sm font-light text-muted-foreground">
						{copy.next}
					</p>
				</StaggerItem>
				<StaggerItem>
					{match(forbidden)
						.with(true, () => (
							<Button asChild>
								<Link to="/">{ERROR_MESSAGE.GO_HOME}</Link>
							</Button>
						))
						.otherwise(() => (
							<Button
								onClick={() => void router.invalidate()}
								disabled={isRetrying}
							>
								{match(isRetrying)
									.with(true, () => ERROR_MESSAGE.RETRYING)
									.otherwise(() => ERROR_MESSAGE.RETRY)}
							</Button>
						))}
				</StaggerItem>
			</Stagger>
		</section>
	);
};
