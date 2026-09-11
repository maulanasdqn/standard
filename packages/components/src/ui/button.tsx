import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactElement } from "react";
import { cn } from "../lib/utils.ts";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 rounded-none text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-neutral-900 text-white hover:bg-neutral-700",
				outline:
					"border border-neutral-300 bg-transparent hover:bg-neutral-100",
				ghost: "bg-transparent hover:bg-neutral-100",
				destructive: "bg-red-600 text-white hover:bg-red-500",
			},
			size: {
				default: "h-9 px-4",
				sm: "h-8 px-3",
				lg: "h-10 px-6",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

type TButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants>;

export const Button = ({
	className,
	variant,
	size,
	...props
}: TButtonProps): ReactElement => (
	<button
		className={cn(buttonVariants({ variant, size }), className)}
		{...props}
	/>
);
