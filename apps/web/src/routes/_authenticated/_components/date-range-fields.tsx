import { Field } from "@app/components/ui/field";
import { Input } from "@app/components/ui/input";
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

const BOUND_LABEL_CLASS = "text-xs text-muted-foreground";

export const DateRangeFields: FC<TDateRangeFieldsProps> = (
	props,
): ReactElement => (
	<div className="grid gap-1.5">
		<span className="text-sm font-medium">{props.label}</span>
		{props.children}
		<div className="grid grid-cols-2 gap-2">
			<Field
				id={`${props.idPrefix}-from`}
				label={TABLE_MESSAGE.FILTER_FROM}
				className="gap-1"
				labelClassName={BOUND_LABEL_CLASS}
			>
				{(control): ReactElement => (
					<Input
						{...control}
						type="date"
						max={props.range.dateTo}
						value={props.range.dateFrom ?? ""}
						onChange={(event) =>
							props.onChange({ dateFrom: event.target.value })
						}
					/>
				)}
			</Field>
			<Field
				id={`${props.idPrefix}-to`}
				label={TABLE_MESSAGE.FILTER_TO}
				className="gap-1"
				labelClassName={BOUND_LABEL_CLASS}
			>
				{(control): ReactElement => (
					<Input
						{...control}
						type="date"
						min={props.range.dateFrom}
						value={props.range.dateTo ?? ""}
						onChange={(event) => props.onChange({ dateTo: event.target.value })}
					/>
				)}
			</Field>
		</div>
	</div>
);
