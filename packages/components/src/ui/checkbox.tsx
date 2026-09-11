import type { InputHTMLAttributes, ReactElement } from "react";
import { cn } from "../lib/utils.ts";

type TCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Checkbox = ({
	className,
	...props
}: TCheckboxProps): ReactElement => (
	<input
		type="checkbox"
		className={cn(
			"size-4 rounded-none border-neutral-300 accent-neutral-900 disabled:opacity-50",
			className,
		)}
		{...props}
	/>
);
