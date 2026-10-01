import { MOTION_GLIDE } from "@app/components/motion/motion-tokens";
import { TabsTrigger } from "@app/components/ui/tabs";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { FC, ReactElement } from "react";
import {
	ACCOUNT_TAB_INDICATOR_ID,
	type TAccountTab,
} from "#/routes/_authenticated/account/_constants/account-tab.ts";

type TAccountTabTriggerProps = {
	value: TAccountTab;
	active: TAccountTab;
	label: string;
	icon: LucideIcon;
};

export const AccountTabTrigger: FC<TAccountTabTriggerProps> = (
	props,
): ReactElement => (
	<TabsTrigger value={props.value}>
		{props.active === props.value && (
			<motion.span
				layoutId={ACCOUNT_TAB_INDICATOR_ID}
				className="absolute inset-0 rounded-md bg-background shadow-sm"
				transition={MOTION_GLIDE}
			/>
		)}
		<span className="relative z-10 flex items-center gap-1.5">
			<props.icon />
			{props.label}
		</span>
	</TabsTrigger>
);
