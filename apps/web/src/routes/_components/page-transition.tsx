import { FadeIn } from "@app/components/motion/fade-in";
import type { FC, ReactElement, ReactNode } from "react";
import { usePageTransitionKey } from "#/routes/_hooks/use-page-transition-key.ts";

type TPageTransitionProps = {
	children: ReactNode;
};

export const PageTransition: FC<TPageTransitionProps> = (
	props,
): ReactElement => {
	const transitionKey = usePageTransitionKey();

	return <FadeIn key={transitionKey}>{props.children}</FadeIn>;
};
