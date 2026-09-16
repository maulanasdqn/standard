import type { FC, ReactElement, TextareaHTMLAttributes } from "react";
import { cn } from "../lib/utils.ts";

type TTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea: FC<TTextareaProps> = (props): ReactElement => {
	const { className, ...rest } = props;

	return (
		<textarea
			className={cn(
				"min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring dark:bg-input/30 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...rest}
		/>
	);
};
