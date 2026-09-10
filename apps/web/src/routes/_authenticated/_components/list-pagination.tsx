import { Button } from "@app/components/ui/button";
import type { ReactElement } from "react";
import {
	hasNextPage,
	hasPreviousPage,
	type TPageInfo,
} from "#/routes/_authenticated/_utils/pagination.ts";

type TListPaginationProps = {
	pageInfo: TPageInfo;
	noun: string;
	onPageChange: (page: number) => void;
};

export const ListPagination = ({
	pageInfo,
	noun,
	onPageChange,
}: TListPaginationProps): ReactElement => (
	<div className="flex items-center justify-between text-sm text-neutral-600">
		<span>
			Page {pageInfo.page} · {pageInfo.total} {noun}
		</span>
		<div className="flex gap-2">
			<Button
				variant="outline"
				size="sm"
				disabled={!hasPreviousPage(pageInfo)}
				onClick={() => onPageChange(pageInfo.page - 1)}
			>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				disabled={!hasNextPage(pageInfo)}
				onClick={() => onPageChange(pageInfo.page + 1)}
			>
				Next
			</Button>
		</div>
	</div>
);
