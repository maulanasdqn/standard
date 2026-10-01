import {
	MOTION_FLOAT,
	MOTION_SPRING_SOFT,
} from "@app/components/motion/motion-tokens";
import { A } from "@mobily/ts-belt";
import { GalleryVerticalEnd } from "lucide-react";
import { motion } from "motion/react";
import type { FC, ReactElement } from "react";
import { SHOWCASE_ORBS } from "#/routes/_constants/showcase.ts";

export const AuthShowcase: FC = (): ReactElement => (
	<div className="relative hidden overflow-hidden bg-muted lg:block">
		{A.map(SHOWCASE_ORBS, (orb) => (
			<motion.div
				key={orb.id}
				aria-hidden
				className={orb.className}
				animate={{ x: [...orb.drift], y: [...orb.rise], scale: [1, 1.15, 1] }}
				transition={{ ...MOTION_FLOAT, delay: orb.delay }}
			/>
		))}
		<div className="absolute inset-0 flex items-center justify-center">
			<motion.div
				initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
				animate={{ opacity: 1, scale: 1, rotate: 0 }}
				transition={MOTION_SPRING_SOFT}
			>
				<motion.div
					animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
					transition={MOTION_FLOAT}
				>
					<GalleryVerticalEnd className="size-24 text-muted-foreground/30" />
				</motion.div>
			</motion.div>
		</div>
	</div>
);
