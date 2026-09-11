import type { ReactElement, TextareaHTMLAttributes } from "react";
import { cn } from "../lib/utils.ts";

type TTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = ({
	className,
	...props
}: TTextareaProps): ReactElement => (
	<textarea
		className={cn(
			"min-h-24 w-full rounded-none border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 disabled:opacity-50",
			className,
		)}
		{...props}
	/>
);
