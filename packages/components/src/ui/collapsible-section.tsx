import { ChevronDown } from "lucide-react";
import { type FC, type ReactElement, type ReactNode, useId } from "react";
import { cn } from "../lib/utils.ts";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "./collapsible.tsx";

type TCollapsibleSectionProps = {
	title: ReactNode;
	description?: ReactNode;
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	className?: string;
	children: ReactNode;
};

export const CollapsibleSection: FC<TCollapsibleSectionProps> = (
	props,
): ReactElement => {
	const titleId = useId();

	return (
		<section
			aria-labelledby={titleId}
			className={cn("rounded-lg border border-border", props.className)}
		>
			<Collapsible
				defaultOpen={props.defaultOpen}
				open={props.open}
				onOpenChange={props.onOpenChange}
				className="group/section"
			>
				<CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg px-4 py-3 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
					<span className="flex flex-col gap-0.5">
						<span id={titleId} className="text-sm font-medium">
							{props.title}
						</span>
						{props.description !== undefined && (
							<span className="text-xs text-muted-foreground">
								{props.description}
							</span>
						)}
					</span>
					<ChevronDown
						aria-hidden
						className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/section:rotate-180"
					/>
				</CollapsibleTrigger>
				<CollapsibleContent className="px-4 pb-4">
					{props.children}
				</CollapsibleContent>
			</Collapsible>
		</section>
	);
};
