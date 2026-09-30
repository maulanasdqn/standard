import { cn } from "@app/components/lib/utils";
import type { FC, ReactElement } from "react";

const APP_LOGO_SRC = "/favicon.svg";

type TAppLogoProps = {
	className?: string;
};

export const AppLogo: FC<TAppLogoProps> = (props): ReactElement => (
	<img
		src={APP_LOGO_SRC}
		alt=""
		aria-hidden
		className={cn(
			"aspect-square shrink-0 rounded-[22%] ring-1 ring-white/15",
			props.className,
		)}
	/>
);
