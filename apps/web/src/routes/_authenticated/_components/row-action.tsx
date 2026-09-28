import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@app/components/ui/tooltip";
import type { FC, ReactElement } from "react";

type TRowActionProps = {
	label: string;
	children: ReactElement;
};

export const RowAction: FC<TRowActionProps> = (props): ReactElement => (
	<Tooltip>
		<TooltipTrigger asChild>{props.children}</TooltipTrigger>
		<TooltipContent>{props.label}</TooltipContent>
	</Tooltip>
);
