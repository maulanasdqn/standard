import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { match, P } from "ts-pattern";
import { AppSidebar } from "#/routes/_authenticated/_components/app-sidebar.tsx";

const AuthenticatedLayout: FC = (): ReactElement => {
	return (
		<div className="flex h-screen">
			<AppSidebar />
			<main className="flex-1 overflow-y-auto p-6">
				<Outlet />
			</main>
		</div>
	);
};

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: ({ context }) => {
		match(context.session)
			.with(P.nullish, () => {
				throw redirect({ to: "/login" });
			})
			.otherwise(() => undefined);
	},
	component: AuthenticatedLayout,
});
