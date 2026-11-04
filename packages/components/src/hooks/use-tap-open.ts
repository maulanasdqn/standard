import { type MouseEvent, useState } from "react";

export type TTapOpen = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onClick: (event: MouseEvent<HTMLButtonElement>) => void;
};

export const useTapOpen = (): TTapOpen => {
	const [open, setOpen] = useState(false);

	return {
		open,
		onOpenChange: setOpen,
		onClick: (event: MouseEvent<HTMLButtonElement>): void => {
			event.preventDefault();
			setOpen(true);
		},
	};
};
