import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@app/components/ui/table";
import { A } from "@mobily/ts-belt";
import {
	flexRender,
	type ReactTable,
	type RowData,
} from "@tanstack/react-table";
import type { ReactElement } from "react";
import type { TTableFeatures } from "#/libs/table/features.ts";

type TDataTableProps<TData extends RowData> = {
	table: ReactTable<TTableFeatures, TData>;
};

export const DataTable = <TData extends RowData>(
	props: TDataTableProps<TData>,
): ReactElement => (
	<Table>
		<TableHeader>
			{A.map(props.table.getHeaderGroups(), (group) => (
				<TableRow key={group.id}>
					{A.map(group.headers, (header) => (
						<TableHead
							key={header.id}
							className={header.column.columnDef.meta?.className}
						>
							{!header.isPlaceholder &&
								flexRender(header.column.columnDef.header, header.getContext())}
						</TableHead>
					))}
				</TableRow>
			))}
		</TableHeader>
		<TableBody>
			{A.map(props.table.getRowModel().rows, (row) => (
				<TableRow key={row.id}>
					{A.map(row.getAllCells(), (cell) => (
						<TableCell
							key={cell.id}
							className={cell.column.columnDef.meta?.className}
						>
							{flexRender(cell.column.columnDef.cell, cell.getContext())}
						</TableCell>
					))}
				</TableRow>
			))}
		</TableBody>
	</Table>
);
