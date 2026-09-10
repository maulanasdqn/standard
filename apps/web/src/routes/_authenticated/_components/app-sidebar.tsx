import { Button } from "@app/components/ui/button";
import { A } from "@mobily/ts-belt";
import { Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { useSession } from "#/libs/auth/use-session.ts";
import { useSessionSignOut } from "#/routes/_authenticated/_hooks/use-session-sign-out.ts";
import { useVisibleNav } from "#/routes/_authenticated/_hooks/use-visible-nav.ts";

export const AppSidebar = (): ReactElement => {
	const session = useSession();
	const signOut = useSessionSignOut();
	const navItems = useVisibleNav();

	return (
		<aside className="flex w-56 flex-col justify-between border-r border-neutral-200 p-4">
			<nav className="flex flex-col gap-1">
				{A.map(navItems, (item) => (
					<Link
						key={item.to}
						to={item.to}
						className="rounded-none px-3 py-2 text-sm hover:bg-neutral-100 [&.active]:bg-neutral-100 [&.active]:font-medium"
					>
						{item.label}
					</Link>
				))}
			</nav>
			<div className="flex flex-col gap-2">
				{session ? (
					<p className="truncate px-1 text-xs text-neutral-500">
						{session.user.email}
					</p>
				) : null}
				<Button variant="outline" onClick={() => void signOut()}>
					Sign out
				</Button>
			</div>
		</aside>
	);
};
