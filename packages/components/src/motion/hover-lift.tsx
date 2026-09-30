import { motion } from "motion/react";
import type { FC, ReactElement, ReactNode } from "react";
import { MOTION_SPRING } from "./motion-tokens.ts";

type THoverLiftProps = {
	children: ReactNode;
	className?: string;
};

export const HoverLift: FC<THoverLiftProps> = (props): ReactElement => (
	<motion.div
		className={props.className}
		whileHover={{ y: -4 }}
		whileTap={{ scale: 0.98 }}
		transition={MOTION_SPRING}
	>
		{props.children}
	</motion.div>
);
