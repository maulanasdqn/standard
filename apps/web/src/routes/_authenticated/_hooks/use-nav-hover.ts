import { type FocusEvent, useState } from "react";
import type { TNavItem } from "#/routes/_authenticated/_constants/nav.ts";

type TNavTarget = TNavItem["to"];

type TNavHoverState = {
	target: TNavTarget | null;
	visible: boolean;
};

export type TNavHover = TNavHoverState & {
	onEnter: (target: TNavTarget) => void;
	onLeave: () => void;
	onBlurWithin: (event: FocusEvent<HTMLElement>) => void;
};

const HIDDEN: TNavHoverState = { target: null, visible: false };

export const useNavHover = (): TNavHover => {
	const [state, setState] = useState<TNavHoverState>(HIDDEN);

	return {
		...state,
		onEnter: (target: TNavTarget): void => setState({ target, visible: true }),
		onLeave: (): void =>
			setState((current) => ({ target: current.target, visible: false })),
		onBlurWithin: (event: FocusEvent<HTMLElement>): void => {
			const focusStaysInside = event.currentTarget.contains(
				event.relatedTarget,
			);
			setState((current) => ({
				target: current.target,
				visible: current.visible && focusStaysInside,
			}));
		},
	};
};
