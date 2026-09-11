import type { InputHTMLAttributes, ReactElement } from "react";
import { cn } from "../lib/utils.ts";

type TInputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className, ...props }: TInputProps): ReactElement => (
	<input
		className={cn(
			"h-9 w-full rounded-none border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-900 disabled:opacity-50",
			className,
		)}
		{...props}
	/>
);
