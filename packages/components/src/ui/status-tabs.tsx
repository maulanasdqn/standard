import { A, O } from "@mobily/ts-belt";
import type { ReactElement } from "react";
import { Badge } from "./badge.tsx";
import { Tabs, TabsList, TabsTrigger } from "./tabs.tsx";

export type TStatusTab<TValue extends string> = {
	value: TValue;
	label: string;
	count?: number;
};

type TStatusTabsProps<TValue extends string> = {
	tabs: readonly TStatusTab<TValue>[];
	value: TValue;
	onChange: (value: TValue) => void;
	label?: string;
	className?: string;
};

export const StatusTabs = <TValue extends string>(
	props: TStatusTabsProps<TValue>,
): ReactElement => (
	<Tabs
		value={props.value}
		onValueChange={(next): void =>
			O.match(
				A.find(props.tabs, (tab) => tab.value === next),
				(tab): void => props.onChange(tab.value),
				(): void => undefined,
			)
		}
		className={props.className}
	>
		<TabsList aria-label={props.label}>
			{A.map(props.tabs, (tab) => (
				<TabsTrigger
					key={tab.value}
					value={tab.value}
					className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
				>
					{tab.label}{" "}
					{tab.count !== undefined && (
						<Badge
							variant={tab.value === props.value ? "default" : "outline"}
							className="min-w-5 justify-center px-1.5 tabular-nums"
						>
							{tab.count}
						</Badge>
					)}
				</TabsTrigger>
			))}
		</TabsList>
	</Tabs>
);
