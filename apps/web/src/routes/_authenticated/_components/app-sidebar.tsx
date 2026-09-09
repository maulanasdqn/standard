import { Button } from "@app/components/ui/button";
import { A } from "@mobily/ts-belt";
import { Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { NAV_ITEMS } from "#/routes/_authenticated/_constants/nav.ts";
import { useSignOut } from "#/routes/_authenticated/_hooks/use-sign-out.ts";

export const AppSidebar = (): ReactElement => {
	const signOut = useSignOut();

	return (
		<aside className="flex w-56 flex-col justify-between border-r border-neutral-200 p-4">
			<nav className="flex flex-col gap-1">
				{A.map(NAV_ITEMS, (item) => (
					<Link
						key={item.to}
						to={item.to}
						className="rounded-none px-3 py-2 text-sm hover:bg-neutral-100 [&.active]:bg-neutral-100 [&.active]:font-medium"
					>
						{item.label}
					</Link>
				))}
			</nav>
			<Button variant="outline" onClick={() => void signOut()}>
				Sign out
			</Button>
		</aside>
	);
};
