import type { FC, InputHTMLAttributes, ReactElement } from "react";
import { cn } from "../lib/utils.ts";

type TCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Checkbox: FC<TCheckboxProps> = (props): ReactElement => {
	const { className, ...rest } = props;

	return (
		<input
			type="checkbox"
			className={cn(
				"size-4 cursor-pointer rounded-sm border-input accent-primary disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...rest}
		/>
	);
};
