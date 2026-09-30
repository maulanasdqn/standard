import { MotionConfig } from "motion/react";
import type { FC, ReactElement, ReactNode } from "react";
import { MOTION_TRANSITION, REDUCED_MOTION } from "./motion-tokens.ts";

type TMotionProviderProps = {
	children: ReactNode;
};

export const MotionProvider: FC<TMotionProviderProps> = (
	props,
): ReactElement => (
	<MotionConfig
		reducedMotion={REDUCED_MOTION.USER}
		transition={MOTION_TRANSITION}
	>
		{props.children}
	</MotionConfig>
);
