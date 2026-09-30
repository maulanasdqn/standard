import { Guard } from "@app/components/guard/guard";
import {
	MOTION_FOLLOW,
	MOTION_GLIDE,
} from "@app/components/motion/motion-tokens";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@app/components/ui/sidebar";
import { A } from "@mobily/ts-belt";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { FC, ReactElement } from "react";
import {
	NAV_ACTIVE_LAYOUT_ID,
	NAV_HOVER_LAYOUT_ID,
	NAV_ITEMS,
} from "#/routes/_authenticated/_constants/nav.ts";
import { useNavHover } from "#/routes/_authenticated/_hooks/use-nav-hover.ts";
import { useNavSelection } from "#/routes/_authenticated/_hooks/use-nav-selection.ts";

export const AppSidebarNav: FC = (): ReactElement => {
	const selection = useNavSelection();
	const hover = useNavHover();

	return (
		<SidebarMenu onMouseLeave={hover.onLeave} onBlur={hover.onBlurWithin}>
			{A.map(NAV_ITEMS, (item) => {
				const isActive = selection.isActive(item.to);
				return (
					<Guard key={item.to} permissions={item.permissions}>
						<SidebarMenuItem
							onMouseEnter={() => hover.onEnter(item.to)}
							onFocus={() => hover.onEnter(item.to)}
						>
							{hover.target === item.to && (
								<motion.span
									layoutId={NAV_HOVER_LAYOUT_ID}
									className="absolute inset-0 z-0 rounded-md bg-sidebar-accent/50"
									initial={false}
									animate={{ opacity: hover.visible ? 1 : 0 }}
									transition={MOTION_FOLLOW}
								/>
							)}
							{isActive && (
								<motion.span
									layoutId={NAV_ACTIVE_LAYOUT_ID}
									className="absolute inset-0 z-0 rounded-md bg-sidebar-accent shadow-sm"
									transition={MOTION_GLIDE}
								/>
							)}
							<SidebarMenuButton
								asChild
								tooltip={item.label}
								isActive={isActive}
								className="relative z-10 transition-[width,height,padding,color] duration-300 hover:bg-transparent active:bg-transparent data-[active=true]:bg-transparent"
							>
								<Link to={item.to}>
									<item.icon />
									<span>{item.label}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</Guard>
				);
			})}
		</SidebarMenu>
	);
};
