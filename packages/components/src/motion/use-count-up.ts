import {
	animate,
	type MotionValue,
	useMotionValue,
	useTransform,
} from "motion/react";
import { useCallback } from "react";
import { MOTION_DURATION, MOTION_EASE_OUT } from "./motion-tokens.ts";

export type TCountUp = {
	rounded: MotionValue<number>;
	ref: () => () => void;
};

export const useCountUp = (value: number): TCountUp => {
	const count = useMotionValue(0);
	const rounded = useTransform(count, (latest: number): number =>
		Math.round(latest),
	);

	const ref = useCallback((): (() => void) => {
		const controls = animate(count, value, {
			duration: MOTION_DURATION.COUNT,
			ease: MOTION_EASE_OUT,
		});
		return (): void => controls.stop();
	}, [count, value]);

	return { rounded, ref };
};
