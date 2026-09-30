import { motion } from "motion/react";
import type { FC, ReactElement, ReactNode } from "react";
import { fadeUpVariants, MOTION_VARIANT } from "./motion-tokens.ts";

type TFadeInProps = {
	children: ReactNode;
	className?: string;
	delay?: number;
};

export const FadeIn: FC<TFadeInProps> = (props): ReactElement => (
	<motion.div
		className={props.className}
		variants={fadeUpVariants}
		initial={MOTION_VARIANT.HIDDEN}
		animate={MOTION_VARIANT.VISIBLE}
		transition={{ delay: props.delay ?? 0 }}
	>
		{props.children}
	</motion.div>
);
