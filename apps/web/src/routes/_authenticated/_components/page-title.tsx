import { cn } from "@app/components/lib/utils";
import { InfoTooltip } from "@app/components/ui/info-tooltip";
import type { FC, ReactElement, ReactNode } from "react";

type TPageTitleProps = {
	info?: ReactNode;
	className?: string;
	children: ReactNode;
};

export const PageTitle: FC<TPageTitleProps> = (props): ReactElement => (
	<div className="flex items-center gap-2">
		<h1 className={cn("text-xl font-semibold", props.className)}>
			{props.children}
		</h1>
		{props.info !== undefined && <InfoTooltip content={props.info} />}
	</div>
);
