import { PageHeaderSkeleton } from "@app/components/skeleton/page-header-skeleton";
import { TableSkeleton } from "@app/components/skeleton/table-skeleton";
import type { FC, ReactElement } from "react";
import { RouteSkeleton } from "#/routes/_components/route-skeleton.tsx";

type TListPageSkeletonProps = {
	action?: boolean;
	description?: boolean;
	toolbar?: boolean;
	pagination?: boolean;
	columns?: number;
};

export const ListPageSkeleton: FC<TListPageSkeletonProps> = (
	props,
): ReactElement => (
	<RouteSkeleton>
		<PageHeaderSkeleton action={props.action} description={props.description} />
		<TableSkeleton
			toolbar={props.toolbar}
			pagination={props.pagination}
			columns={props.columns}
		/>
	</RouteSkeleton>
);
