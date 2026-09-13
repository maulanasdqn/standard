import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { match, P } from "ts-pattern";
import { EServerUnreachable } from "#/libs/auth/server-unreachable.ts";
import { SESSION_REACH } from "#/libs/auth/session-reach.ts";
import { AppSidebar } from "#/routes/_authenticated/_components/app-sidebar.tsx";

const AuthenticatedLayout: FC = (): ReactElement => (
	<div className="flex min-h-dvh">
		<AppSidebar />
		<main className="min-w-0 flex-1 overflow-y-auto p-6">
			<Outlet />
		</main>
	</div>
);

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: ({ context }) => {
		match(context)
			.with({ reach: SESSION_REACH.UNREACHABLE }, () => {
				throw new EServerUnreachable();
			})
			.with({ session: P.nullish }, () => {
				throw redirect({ to: "/login" });
			})
			.otherwise(() => undefined);
	},
	component: AuthenticatedLayout,
});
