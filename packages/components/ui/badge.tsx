import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactElement } from "react";
import { cn } from "../lib/utils.ts";

const badgeVariants = cva(
	"inline-flex items-center rounded-none px-2 py-0.5 text-xs font-medium",
	{
		variants: {
			variant: {
				default: "bg-neutral-900 text-white",
				outline: "border border-neutral-300 text-neutral-700",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

type TBadgeProps = HTMLAttributes<HTMLSpanElement> &
	VariantProps<typeof badgeVariants>;

export const Badge = ({
	className,
	variant,
	...props
}: TBadgeProps): ReactElement => (
	<span className={cn(badgeVariants({ variant }), className)} {...props} />
);
