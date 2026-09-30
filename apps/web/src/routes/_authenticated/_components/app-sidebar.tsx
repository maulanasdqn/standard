import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
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
import { Link } from "@tanstack/react-router";
import {
	ChevronsUpDown,
	CircleUser,
	Command,
	LogOut,
	Moon,
} from "lucide-react";
import type { FC, ReactElement } from "react";
import { useSession } from "#/libs/auth/use-session.ts";
import { useSessionSignOut } from "#/routes/_authenticated/_hooks/use-session-sign-out.ts";
import { useTheme } from "#/routes/_authenticated/_hooks/use-theme.ts";
import { Switch } from "@app/components/ui/switch";
import { APP_MESSAGE, NAV_MESSAGE } from "@app/messages";
import { AppLogo } from "#/routes/_components/app-logo.tsx";
import { AppSidebarNav } from "#/routes/_authenticated/_components/app-sidebar-nav.tsx";

export const AppSidebar: FC = (): ReactElement => {
	const session = useSession();
	const signOut = useSessionSignOut();
	const theme = useTheme();

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link to="/dashboard">
								<AppLogo className="size-8" />
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
						<AppSidebarNav />
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
								<DropdownMenuItem asChild>
									<Link to="/account">
										<CircleUser />
										{NAV_MESSAGE.ACCOUNT}
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
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
									{NAV_MESSAGE.SIGN_OUT}
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
