import { Stagger, StaggerItem } from "@app/components/motion/stagger";
import type { ErrorComponentProps } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { isForbidden } from "#/libs/auth/forbidden.ts";
import { isServerUnreachable } from "#/libs/auth/server-unreachable.ts";
import { isRecordNotFound } from "#/libs/orpc/record-not-found.ts";
import { RouteErrorAction } from "#/routes/_components/route-error-action.tsx";
import {
	ROUTE_ERROR_COPY,
	ROUTE_ERROR_KIND,
	type TRouteErrorKind,
} from "#/routes/_constants/route-error.ts";

const ERROR_TITLE_ID = "route-error-title";

const routeErrorKind = (error: unknown): TRouteErrorKind =>
	match(error)
		.when(isForbidden, () => ROUTE_ERROR_KIND.FORBIDDEN)
		.when(isRecordNotFound, () => ROUTE_ERROR_KIND.RECORD_MISSING)
		.when(isServerUnreachable, () => ROUTE_ERROR_KIND.UNREACHABLE)
		.otherwise(() => ROUTE_ERROR_KIND.UNEXPECTED);

export const RouteErrorScreen: FC<ErrorComponentProps> = (
	props,
): ReactElement => {
	const kind = routeErrorKind(props.error);
	const copy = ROUTE_ERROR_COPY[kind];

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
					<RouteErrorAction kind={kind} />
				</StaggerItem>
			</Stagger>
		</section>
	);
};
