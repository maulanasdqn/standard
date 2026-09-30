import { motion } from "motion/react";
import type { FC, ReactElement } from "react";
import { useCountUp } from "./use-count-up.ts";

type TCountUpProps = {
	value: number;
	className?: string;
};

export const CountUp: FC<TCountUpProps> = (props): ReactElement => {
	const count = useCountUp(props.value);

	return <motion.span className={props.className}>{count}</motion.span>;
};
