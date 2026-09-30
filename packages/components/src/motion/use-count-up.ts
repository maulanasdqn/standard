import {
	animate,
	type MotionValue,
	useMotionValue,
	useTransform,
} from "motion/react";
import { useEffect } from "react";
import { MOTION_DURATION, MOTION_EASE_OUT } from "./motion-tokens.ts";

export const useCountUp = (value: number): MotionValue<number> => {
	const count = useMotionValue(0);
	const rounded = useTransform(count, (latest: number): number =>
		Math.round(latest),
	);

	useEffect((): (() => void) => {
		const controls = animate(count, value, {
			duration: MOTION_DURATION.COUNT,
			ease: MOTION_EASE_OUT,
		});
		return (): void => controls.stop();
	}, [count, value]);

	return rounded;
};
