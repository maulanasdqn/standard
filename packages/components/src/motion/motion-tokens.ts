import { stagger, type Transition, type Variants } from "motion/react";

export const MOTION_VARIANT = {
	HIDDEN: "hidden",
	VISIBLE: "visible",
	EXIT: "exit",
} as const;

export const REDUCED_MOTION = {
	USER: "user",
} as const;

export const MOTION_EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const MOTION_DURATION = {
	FAST: 0.18,
	BASE: 0.32,
	SLOW: 0.6,
	COUNT: 0.9,
} as const;

export const MOTION_STAGGER = {
	TIGHT: 0.03,
	BASE: 0.06,
	ROW_CAP: 12,
} as const;

export const MOTION_SPRING: Transition = {
	type: "spring",
	stiffness: 380,
	damping: 30,
	mass: 0.8,
};

export const MOTION_PULSE: Transition = {
	duration: 1.6,
	repeat: Number.POSITIVE_INFINITY,
	ease: "easeOut",
};

export const MOTION_FLOAT: Transition = {
	duration: 6,
	repeat: Number.POSITIVE_INFINITY,
	repeatType: "mirror",
	ease: "easeInOut",
};

export const MOTION_FOLLOW: Transition = {
	type: "tween",
	duration: 0.12,
	ease: MOTION_EASE_OUT,
};

export const MOTION_GLIDE: Transition = {
	type: "tween",
	duration: 0.28,
	ease: MOTION_EASE_OUT,
};

export const MOTION_SPRING_SOFT: Transition = {
	type: "spring",
	stiffness: 120,
	damping: 14,
};

export const MOTION_TRANSITION: Transition = {
	duration: MOTION_DURATION.BASE,
	ease: MOTION_EASE_OUT,
};

export const fadeUpVariants: Variants = {
	[MOTION_VARIANT.HIDDEN]: { opacity: 0, y: 12 },
	[MOTION_VARIANT.VISIBLE]: {
		opacity: 1,
		y: 0,
		transition: MOTION_TRANSITION,
	},
	[MOTION_VARIANT.EXIT]: {
		opacity: 0,
		y: -8,
		transition: { duration: MOTION_DURATION.FAST },
	},
};

export const popVariants: Variants = {
	[MOTION_VARIANT.HIDDEN]: { opacity: 0, scale: 0.9 },
	[MOTION_VARIANT.VISIBLE]: {
		opacity: 1,
		scale: 1,
		transition: MOTION_SPRING,
	},
	[MOTION_VARIANT.EXIT]: {
		opacity: 0,
		scale: 0.85,
		transition: { duration: MOTION_DURATION.FAST },
	},
};

export const staggerVariants = (interval: number): Variants => ({
	[MOTION_VARIANT.HIDDEN]: {},
	[MOTION_VARIANT.VISIBLE]: {
		transition: { delayChildren: stagger(interval) },
	},
});

export const rowDelay = (index: number): number =>
	Math.min(index, MOTION_STAGGER.ROW_CAP) * MOTION_STAGGER.TIGHT;
