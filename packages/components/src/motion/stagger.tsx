import { motion } from "motion/react";
import type { FC, ReactElement, ReactNode } from "react";
import {
	fadeUpVariants,
	MOTION_STAGGER,
	MOTION_VARIANT,
	staggerVariants,
} from "./motion-tokens.ts";

type TStaggerProps = {
	children: ReactNode;
	className?: string;
	interval?: number;
};

type TStaggerItemProps = {
	children: ReactNode;
	className?: string;
};

export const Stagger: FC<TStaggerProps> = (props): ReactElement => (
	<motion.div
		className={props.className}
		variants={staggerVariants(props.interval ?? MOTION_STAGGER.BASE)}
		initial={MOTION_VARIANT.HIDDEN}
		animate={MOTION_VARIANT.VISIBLE}
	>
		{props.children}
	</motion.div>
);

export const StaggerItem: FC<TStaggerItemProps> = (props): ReactElement => (
	<motion.div className={props.className} variants={fadeUpVariants}>
		{props.children}
	</motion.div>
);
