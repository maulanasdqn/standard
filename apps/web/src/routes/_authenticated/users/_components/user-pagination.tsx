import { D } from "@mobily/ts-belt";
import { Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import {
	hasNextPage,
	hasPreviousPage,
	type TPageInfo,
} from "#/routes/_authenticated/users/_utils/pagination.ts";

const LINK_CLASS =
	"border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 aria-disabled:pointer-events-none aria-disabled:opacity-50";

export const UserPagination = (pageInfo: TPageInfo): ReactElement => (
	<div className="flex items-center justify-between text-sm text-neutral-600">
		<span>
			Page {pageInfo.page} · {pageInfo.total} users
		</span>
		<div className="flex gap-2">
			<Link
				to="/users"
				search={(prev) => D.merge(prev, { page: pageInfo.page - 1 })}
				disabled={!hasPreviousPage(pageInfo)}
				className={LINK_CLASS}
			>
				Previous
			</Link>
			<Link
				to="/users"
				search={(prev) => D.merge(prev, { page: pageInfo.page + 1 })}
				disabled={!hasNextPage(pageInfo)}
				className={LINK_CLASS}
			>
				Next
			</Link>
		</div>
	</div>
);
