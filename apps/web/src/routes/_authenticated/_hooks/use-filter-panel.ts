import { A } from "@mobily/ts-belt";
import { useState } from "react";

export type TFilterPanelOptions<TValues extends object> = {
	applied: TValues;
	empty: TValues;
	normalize: (values: TValues) => TValues;
	count: (values: TValues) => number;
	commit: (values: TValues) => void;
};

export type TFilterPanel<TValues extends object> = {
	draft: TValues;
	activeCount: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDraftChange: (patch: Partial<TValues>) => void;
	onApply: () => void;
	onReset: () => void;
	onClear: () => void;
};

export const blankToUndefined = (
	value: string | undefined,
): string | undefined => (value === "" ? undefined : value);

export const definedCount = (values: readonly unknown[]): number =>
	A.length(A.filter(values, (value) => value !== undefined));

export const useFilterPanel = <TValues extends object>(
	options: TFilterPanelOptions<TValues>,
): TFilterPanel<TValues> => {
	const [draft, setDraft] = useState<TValues>(options.applied);
	const [open, setOpen] = useState(false);

	return {
		draft,
		activeCount: options.count(options.applied),
		open,
		onOpenChange: (next: boolean): void => {
			setDraft(options.applied);
			setOpen(next);
		},
		onDraftChange: (patch: Partial<TValues>): void =>
			setDraft((current) => ({ ...current, ...patch })),
		onApply: (): void => {
			options.commit(options.normalize(draft));
			setOpen(false);
		},
		onReset: (): void => setDraft(options.empty),
		onClear: (): void => options.commit(options.empty),
	};
};
