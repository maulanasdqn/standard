import { motion } from "motion/react";
import type { FC, ReactElement, ReactNode } from "react";
import { cn } from "../lib/utils.ts";
import { MOTION_DURATION, MOTION_EASE_OUT, rowDelay } from "./motion-tokens.ts";

type TMotionTableRowProps = {
	children: ReactNode;
	index: number;
	className?: string;
};

export const MotionTableRow: FC<TMotionTableRowProps> = (
	props,
): ReactElement => (
	<motion.tr
		className={cn("hover:bg-muted/50", props.className)}
		initial={{ opacity: 0, y: 6 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{
			duration: MOTION_DURATION.BASE,
			ease: MOTION_EASE_OUT,
			delay: rowDelay(props.index),
		}}
	>
		{props.children}
	</motion.tr>
);
