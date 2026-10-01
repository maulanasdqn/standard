import { Label } from "@app/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@app/components/ui/select";
import { TABLE_MESSAGE } from "@app/messages";
import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";

const ANY_VALUE = "__any__";

export type TFilterOption = {
	value: string;
	label: string;
};

type TFilterSelectProps = {
	id: string;
	label: string;
	value: string | undefined;
	options: readonly TFilterOption[];
	onChange: (value: string | undefined) => void;
};

export const FilterSelect: FC<TFilterSelectProps> = (props): ReactElement => (
	<div className="grid gap-1.5">
		<Label htmlFor={props.id}>{props.label}</Label>
		<Select
			value={props.value ?? ANY_VALUE}
			onValueChange={(value) =>
				props.onChange(value === ANY_VALUE ? undefined : value)
			}
		>
			<SelectTrigger id={props.id} className="w-full">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={ANY_VALUE}>{TABLE_MESSAGE.FILTER_ANY}</SelectItem>
				{A.map(props.options, (option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	</div>
);
