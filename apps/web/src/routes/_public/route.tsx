import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { match, P } from "ts-pattern";

export const Route = createFileRoute("/_public")({
	beforeLoad: ({ context }) => {
		match(context.session)
			.with(P.nullish, () => undefined)
			.otherwise(() => {
				throw redirect({ to: "/notes" });
			});
	},
	component: (): ReactElement => <Outlet />,
});
