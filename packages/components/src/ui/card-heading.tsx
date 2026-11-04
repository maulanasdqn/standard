import type { FC, ReactElement, ReactNode } from "react";
import { cn } from "../lib/utils.ts";
import { CardTitle } from "./card.tsx";
import { InfoTooltip } from "./info-tooltip.tsx";

type TCardHeadingProps = {
	info?: ReactNode;
	className?: string;
	children: ReactNode;
};

export const CardHeading: FC<TCardHeadingProps> = (props): ReactElement => (
	<CardTitle className={cn("flex items-center gap-2", props.className)}>
		{props.children}
		{props.info !== undefined && <InfoTooltip content={props.info} />}
	</CardTitle>
);
