import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { TABLE_MESSAGE } from "@app/messages";
import type { FC, ReactElement, ReactNode } from "react";
import type { TDayRange } from "#/libs/table/day-range.ts";

type TDateRangeFieldsProps = {
	idPrefix: string;
	label: string;
	range: TDayRange;
	onChange: (patch: TDayRange) => void;
	children?: ReactNode;
};

export const DateRangeFields: FC<TDateRangeFieldsProps> = (
	props,
): ReactElement => (
	<div className="grid gap-1.5">
		<span className="text-sm font-medium">{props.label}</span>
		{props.children}
		<div className="grid grid-cols-2 gap-2">
			<div className="grid gap-1">
				<Label
					htmlFor={`${props.idPrefix}-from`}
					className="text-xs text-muted-foreground"
				>
					{TABLE_MESSAGE.FILTER_FROM}
				</Label>
				<Input
					id={`${props.idPrefix}-from`}
					type="date"
					max={props.range.dateTo}
					value={props.range.dateFrom ?? ""}
					onChange={(event) => props.onChange({ dateFrom: event.target.value })}
				/>
			</div>
			<div className="grid gap-1">
				<Label
					htmlFor={`${props.idPrefix}-to`}
					className="text-xs text-muted-foreground"
				>
					{TABLE_MESSAGE.FILTER_TO}
				</Label>
				<Input
					id={`${props.idPrefix}-to`}
					type="date"
					min={props.range.dateFrom}
					value={props.range.dateTo ?? ""}
					onChange={(event) => props.onChange({ dateTo: event.target.value })}
				/>
			</div>
		</div>
	</div>
);
