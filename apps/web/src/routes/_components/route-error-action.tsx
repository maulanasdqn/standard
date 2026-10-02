import { Button } from "@app/components/ui/button";
import { ERROR_MESSAGE } from "@app/messages";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { listPathOf } from "#/libs/navigation/list-path.ts";
import {
	ROUTE_ERROR_KIND,
	type TRouteErrorKind,
} from "#/routes/_constants/route-error.ts";

type TRouteErrorActionProps = {
	kind: TRouteErrorKind;
};

const RetryButton: FC = (): ReactElement => {
	const router = useRouter();
	const isRetrying = useRouterState({ select: (state) => state.isLoading });

	return (
		<Button onClick={() => void router.invalidate()} disabled={isRetrying}>
			{match(isRetrying)
				.with(true, () => ERROR_MESSAGE.RETRYING)
				.otherwise(() => ERROR_MESSAGE.RETRY)}
		</Button>
	);
};

const BackToListButton: FC = (): ReactElement => {
	const listPath = useRouterState({
		select: (state) => listPathOf(state.location.pathname),
	});

	return (
		<Button asChild>
			<Link to={listPath}>{ERROR_MESSAGE.BACK_TO_LIST}</Link>
		</Button>
	);
};

export const RouteErrorAction: FC<TRouteErrorActionProps> = (
	props,
): ReactElement =>
	match(props.kind)
		.with(ROUTE_ERROR_KIND.FORBIDDEN, () => (
			<Button asChild>
				<Link to="/">{ERROR_MESSAGE.GO_HOME}</Link>
			</Button>
		))
		.with(ROUTE_ERROR_KIND.RECORD_MISSING, () => <BackToListButton />)
		.with(ROUTE_ERROR_KIND.UNREACHABLE, ROUTE_ERROR_KIND.UNEXPECTED, () => (
			<RetryButton />
		))
		.exhaustive();
