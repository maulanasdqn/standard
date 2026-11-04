import { AnimatePresence, motion } from "motion/react";
import type { FC, ReactElement } from "react";
import { UI_MESSAGE } from "../lib/messages.ts";
import { cn } from "../lib/utils.ts";
import { MOTION_SWEEP } from "../motion/motion-tokens.ts";

type TProgressBarProps = {
	active: boolean;
	className?: string;
};

export const ProgressBar: FC<TProgressBarProps> = (props): ReactElement => (
	<AnimatePresence>
		{props.active && (
			<motion.div
				role="progressbar"
				aria-label={UI_MESSAGE.LOADING}
				aria-busy
				data-slot="progress-bar"
				className={cn(
					"pointer-events-none h-0.5 w-full overflow-hidden bg-primary/15",
					props.className,
				)}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
			>
				<motion.div
					className="h-full w-1/3 rounded-full bg-primary"
					initial={{ x: "-100%" }}
					animate={{ x: "300%" }}
					transition={MOTION_SWEEP}
				/>
			</motion.div>
		)}
	</AnimatePresence>
);
