import type {
	FC,
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

export const Table: FC<TTableProps> = (props): ReactElement => {
	const { className, ...rest } = props;

	return (
		<div className="w-full overflow-x-auto border border-neutral-200">
			<table className={cn("w-full text-sm", className)} {...rest} />
		</div>
	);
};

export const TableHeader: FC<TTableSectionProps> = (props): ReactElement => {
	const { className, ...rest } = props;

	return (
		<thead
			className={cn("border-b border-neutral-200 bg-neutral-50", className)}
			{...rest}
		/>
	);
};

export const TableBody: FC<TTableSectionProps> = (props): ReactElement => {
	const { className, ...rest } = props;

	return (
		<tbody className={cn("divide-y divide-neutral-200", className)} {...rest} />
	);
};

export const TableRow: FC<TTableRowProps> = (props): ReactElement => {
	const { className, ...rest } = props;

	return <tr className={cn("hover:bg-neutral-50", className)} {...rest} />;
};

export const TableHead: FC<TTableHeadProps> = (props): ReactElement => {
	const { className, ...rest } = props;

	return (
		<th
			className={cn(
				"px-4 py-2 text-left font-medium text-neutral-600",
				className,
			)}
			{...rest}
		/>
	);
};

export const TableCell: FC<TTableCellProps> = (props): ReactElement => {
	const { className, ...rest } = props;

	return <td className={cn("px-4 py-3 align-middle", className)} {...rest} />;
};
