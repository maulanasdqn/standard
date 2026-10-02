import { Info } from "lucide-react";
import type { FC, ReactElement, ReactNode } from "react";
import { UI_MESSAGE } from "../lib/messages.ts";
import { cn } from "../lib/utils.ts";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./tooltip.tsx";

type TInfoTooltipProps = {
	content: ReactNode;
	label?: string;
	className?: string;
};

export const InfoTooltip: FC<TInfoTooltipProps> = (props): ReactElement => {
	const { label = UI_MESSAGE.MORE_INFO } = props;

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						aria-label={label}
						className={cn(
							"inline-flex size-4 cursor-help items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
							props.className,
						)}
					>
						<Info className="size-3.5" aria-hidden />
					</button>
				</TooltipTrigger>
				<TooltipContent className="max-w-xs">{props.content}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
