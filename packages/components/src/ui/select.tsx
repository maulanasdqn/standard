import type { ReactElement, SelectHTMLAttributes } from "react";
import { cn } from "../lib/utils.ts";

type TSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = ({ className, ...props }: TSelectProps): ReactElement => (
	<select
		className={cn(
			"h-9 w-full rounded-none border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-900 disabled:opacity-50",
			className,
		)}
		{...props}
	/>
);
