import type {
	HTMLAttributes,
	ReactElement,
	TdHTMLAttributes,
	ThHTMLAttributes,
} from "react";
import { cn } from "../lib/utils.ts";

type TTableProps = HTMLAttributes<HTMLTableElement>;
type TTableSectionProps = HTMLAttributes<HTMLTableSectionElement>;
type TTableRowProps = HTMLAttributes<HTMLTableRowElement>;
type TTableHeadProps = ThHTMLAttributes<HTMLTableCellElement>;
type TTableCellProps = TdHTMLAttributes<HTMLTableCellElement>;

export const Table = ({ className, ...props }: TTableProps): ReactElement => (
	<div className="w-full overflow-x-auto border border-neutral-200">
		<table className={cn("w-full text-sm", className)} {...props} />
	</div>
);

export const TableHeader = ({
	className,
	...props
}: TTableSectionProps): ReactElement => (
	<thead
		className={cn("border-b border-neutral-200 bg-neutral-50", className)}
		{...props}
	/>
);

export const TableBody = ({
	className,
	...props
}: TTableSectionProps): ReactElement => (
	<tbody className={cn("divide-y divide-neutral-200", className)} {...props} />
);

export const TableRow = ({
	className,
	...props
}: TTableRowProps): ReactElement => (
	<tr className={cn("hover:bg-neutral-50", className)} {...props} />
);

export const TableHead = ({
	className,
	...props
}: TTableHeadProps): ReactElement => (
	<th
		className={cn(
			"px-4 py-2 text-left font-medium text-neutral-600",
			className,
		)}
		{...props}
	/>
);

export const TableCell = ({
	className,
	...props
}: TTableCellProps): ReactElement => (
	<td className={cn("px-4 py-3 align-middle", className)} {...props} />
);
