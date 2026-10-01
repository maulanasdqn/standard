import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@app/components/ui/popover";
import { TABLE_MESSAGE } from "@app/messages";
import { SlidersHorizontal, X } from "lucide-react";
import type { FC, ReactElement, ReactNode } from "react";

type TFilterPanelProps = {
	activeCount: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onApply: () => void;
	onReset: () => void;
	onClear: () => void;
	children: ReactNode;
};

export const FilterPanel: FC<TFilterPanelProps> = (props): ReactElement => (
	<div className="flex items-center gap-1">
		<Popover open={props.open} onOpenChange={props.onOpenChange}>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm">
					<SlidersHorizontal />
					{TABLE_MESSAGE.FILTERS}
					{props.activeCount > 0 && (
						<Badge className="h-5 min-w-5 rounded-full px-1.5 tabular-nums">
							{props.activeCount}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-80">
				<form
					className="grid gap-4"
					onSubmit={(event) => {
						event.preventDefault();
						props.onApply();
					}}
				>
					<div className="grid gap-4">{props.children}</div>
					<div className="flex justify-between gap-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={props.onReset}
						>
							{TABLE_MESSAGE.FILTER_RESET}
						</Button>
						<Button type="submit" size="sm">
							{TABLE_MESSAGE.FILTER_APPLY}
						</Button>
					</div>
				</form>
			</PopoverContent>
		</Popover>
		{props.activeCount > 0 && (
			<Button variant="ghost" size="sm" onClick={props.onClear}>
				<X />
				{TABLE_MESSAGE.FILTER_CLEAR}
			</Button>
		)}
	</div>
);
