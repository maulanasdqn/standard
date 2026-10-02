import {
	MOTION_FLOAT,
	MOTION_SPRING_SOFT,
} from "@app/components/motion/motion-tokens";
import { APP_MESSAGE } from "@app/messages";
import { A } from "@mobily/ts-belt";
import { motion } from "motion/react";
import type { FC, ReactElement } from "react";
import { BrandMark } from "#/routes/_components/brand-mark.tsx";
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
		<div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-10 text-center">
			<motion.div
				initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
				animate={{ opacity: 1, scale: 1, rotate: 0 }}
				transition={MOTION_SPRING_SOFT}
			>
				<motion.div
					animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
					transition={MOTION_FLOAT}
				>
					<BrandMark className="size-24 drop-shadow-xl" />
				</motion.div>
			</motion.div>
			<motion.div
				className="flex flex-col gap-2"
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={MOTION_SPRING_SOFT}
			>
				<p className="text-3xl font-semibold tracking-tight">
					{APP_MESSAGE.NAME}
				</p>
				<p className="max-w-xs text-sm text-muted-foreground">
					{APP_MESSAGE.TAGLINE}
				</p>
			</motion.div>
		</div>
	</div>
);
