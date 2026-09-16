import type { FC, ReactElement, SelectHTMLAttributes } from "react";
import { cn } from "../lib/utils.ts";

type TSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select: FC<TSelectProps> = (props): ReactElement => {
	const { className, ...rest } = props;

	return (
		<select
			className={cn(
				"h-9 w-full cursor-pointer rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:border-ring dark:bg-input/30 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...rest}
		/>
	);
};
