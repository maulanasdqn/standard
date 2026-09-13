import { Button } from "@app/components/ui/button";
import type { FC, ReactElement } from "react";
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

export const ListPagination: FC<TListPaginationProps> = (
	props,
): ReactElement => (
	<div className="flex items-center justify-between text-sm text-neutral-600">
		<span>
			Page {props.pageInfo.page} · {props.pageInfo.total} {props.noun}
		</span>
		<div className="flex gap-2">
			<Button
				variant="outline"
				size="sm"
				disabled={!hasPreviousPage(props.pageInfo)}
				onClick={() => props.onPageChange(props.pageInfo.page - 1)}
			>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				disabled={!hasNextPage(props.pageInfo)}
				onClick={() => props.onPageChange(props.pageInfo.page + 1)}
			>
				Next
			</Button>
		</div>
	</div>
);
