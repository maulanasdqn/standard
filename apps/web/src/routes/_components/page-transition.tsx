import type { FC, ReactElement, ReactNode } from "react";
import { usePageTransitionKey } from "#/routes/_hooks/use-page-transition-key.ts";

type TPageTransitionProps = {
	children: ReactNode;
};

export const PageTransition: FC<TPageTransitionProps> = (
	props,
): ReactElement => {
	const transitionKey = usePageTransitionKey();

	return (
		<div
			key={transitionKey}
			className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out motion-reduce:animate-none"
		>
			{props.children}
		</div>
	);
};
