import type { KeyboardEvent, MouseEvent } from "react";

const INTERACTIVE =
	"a, button, input, select, textarea, label, [role=menuitem], [role=combobox], [role=checkbox]";

const OPEN_KEY = "Enter";

export type TRowOpenProps = {
	className?: string;
	tabIndex?: number;
	onClick?: (event: MouseEvent<HTMLTableRowElement>) => void;
	onKeyDown?: (event: KeyboardEvent<HTMLTableRowElement>) => void;
};

const hasTextSelection = (): boolean =>
	(window.getSelection()?.toString() ?? "") !== "";

export const isRowOpenClick = (event: MouseEvent<HTMLElement>): boolean => {
	const target = event.target;
	const row = event.currentTarget;
	const inside = target instanceof Element && row.contains(target);
	const control = inside ? target.closest(INTERACTIVE) : null;
	const onControl = control !== null && row.contains(control);

	return inside && !onControl && !hasTextSelection();
};

export const rowOpenProps = (open: (() => void) | undefined): TRowOpenProps =>
	open === undefined
		? {}
		: {
				className:
					"cursor-pointer focus-visible:bg-muted/50 focus-visible:outline-none",
				tabIndex: 0,
				onClick: (event): void => (isRowOpenClick(event) ? open() : undefined),
				onKeyDown: (event): void =>
					event.key === OPEN_KEY && event.target === event.currentTarget
						? open()
						: undefined,
			};
