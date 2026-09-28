import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import { Skeleton } from "../ui/skeleton.tsx";
import { skeletonSlots } from "./skeleton-slots.ts";

const TABLE_SKELETON_DEFAULT = {
	ROWS: 5,
	COLUMNS: 4,
} as const;

type TTableSkeletonRowProps = {
	columns: readonly number[];
};

type TTableSkeletonProps = {
	rows?: number;
	columns?: number;
	toolbar?: boolean;
	pagination?: boolean;
};

const TableSkeletonRow: FC<TTableSkeletonRowProps> = (props): ReactElement => (
	<div className="flex gap-6 px-4 py-4">
		{A.map(props.columns, (column) => (
			<Skeleton key={column} className="h-4 flex-1" />
		))}
	</div>
);

export const TableSkeleton: FC<TTableSkeletonProps> = (props): ReactElement => {
	const {
		rows = TABLE_SKELETON_DEFAULT.ROWS,
		columns = TABLE_SKELETON_DEFAULT.COLUMNS,
		toolbar = true,
		pagination = true,
	} = props;
	const columnSlots = skeletonSlots(columns);

	return (
		<div className="flex flex-col gap-4">
			{toolbar && (
				<div className="flex items-center justify-between gap-4">
					<Skeleton className="h-9 w-full max-w-sm" />
					<Skeleton className="h-9 w-28 shrink-0" />
				</div>
			)}
			<div className="overflow-hidden rounded-xl border border-border">
				<div className="border-b border-border bg-muted">
					<TableSkeletonRow columns={columnSlots} />
				</div>
				<div className="divide-y divide-border">
					{A.map(skeletonSlots(rows), (row) => (
						<TableSkeletonRow key={row} columns={columnSlots} />
					))}
				</div>
			</div>
			{pagination && (
				<div className="flex items-center justify-between gap-4">
					<Skeleton className="h-9 w-40" />
					<Skeleton className="h-9 w-64" />
				</div>
			)}
		</div>
	);
};
