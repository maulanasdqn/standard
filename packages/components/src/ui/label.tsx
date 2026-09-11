import type { LabelHTMLAttributes, ReactElement, ReactNode } from "react";
import { cn } from "../lib/utils.ts";

type TLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
	htmlFor: string;
	children: ReactNode;
};

export const Label = ({
	className,
	htmlFor,
	children,
	...props
}: TLabelProps): ReactElement => (
	<label
		htmlFor={htmlFor}
		className={cn("text-sm font-medium", className)}
		{...props}
	>
		{children}
	</label>
);
