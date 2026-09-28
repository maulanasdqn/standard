import { Guard } from "@app/components/guard/guard";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@app/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@app/components/ui/sidebar";
import { A } from "@mobily/ts-belt";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { ChevronsUpDown, Command, LogOut, Moon } from "lucide-react";
import type { FC, ReactElement } from "react";
import { useSession } from "#/libs/auth/use-session.ts";
import { useSessionSignOut } from "#/routes/_authenticated/_hooks/use-session-sign-out.ts";
import { useTheme } from "#/routes/_authenticated/_hooks/use-theme.ts";
import { Switch } from "@app/components/ui/switch";
import { APP_MESSAGE } from "@app/messages";
import { NAV_ITEMS } from "#/routes/_authenticated/_constants/nav.ts";

export const AppSidebar: FC = (): ReactElement => {
	const session = useSession();
	const signOut = useSessionSignOut();
	const matchRoute = useMatchRoute();
	const theme = useTheme();

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link to="/dashboard">
								<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
									<Command className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{APP_MESSAGE.NAME}
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>{APP_MESSAGE.NAVIGATION}</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{A.map(NAV_ITEMS, (item) => (
								<Guard key={item.to} permissions={item.permissions}>
									<SidebarMenuItem>
										<SidebarMenuButton
											asChild
											tooltip={item.label}
											isActive={!!matchRoute({ to: item.to, fuzzy: true })}
										>
											<Link to={item.to}>
												<item.icon />
												<span>{item.label}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</Guard>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton size="lg">
									<div className="bg-sidebar-accent text-sidebar-accent-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
										<Command className="size-4" />
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate text-xs text-muted-foreground">
											{session?.user.email}
										</span>
									</div>
									<ChevronsUpDown className="ml-auto size-4" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								side="top"
								className="w-(--radix-dropdown-menu-trigger-width)"
							>
								<DropdownMenuItem
									onSelect={(event) => {
										event.preventDefault();
										theme.toggle();
									}}
								>
									<Moon />
									{APP_MESSAGE.DARK_MODE}
									<Switch
										checked={theme.isDark}
										tabIndex={-1}
										className="pointer-events-none ml-auto"
									/>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => void signOut()}>
									<LogOut />
									Sign out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
};
