import { motion } from "motion/react";
import type { FC, ReactElement } from "react";

type TEmptyStateProps = {
	message: string;
};

export const EmptyState: FC<TEmptyStateProps> = (props): ReactElement => (
	<motion.output
		className="block text-sm text-muted-foreground"
		initial={{ opacity: 0, y: 4 }}
		animate={{ opacity: 1, y: 0 }}
	>
		{props.message}
	</motion.output>
);
