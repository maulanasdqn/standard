import { FadeIn } from "@app/components/motion/fade-in";
import { APP_MESSAGE } from "@app/messages";
import { Link } from "@tanstack/react-router";
import type { FC, ReactElement, ReactNode } from "react";
import { AppLogo } from "#/routes/_components/app-logo.tsx";
import { AuthShowcase } from "#/routes/_components/auth-showcase.tsx";

type TAuthLayoutProps = {
	children: ReactNode;
};

export const AuthLayout: FC<TAuthLayoutProps> = (props): ReactElement => (
	<div className="grid min-h-svh lg:grid-cols-2">
		<div className="flex flex-col gap-4 p-6 md:p-10">
			<FadeIn className="flex justify-center gap-2 md:justify-start">
				<Link to="/" className="group flex items-center gap-2 font-medium">
					<AppLogo className="size-6 transition-transform duration-300 group-hover:rotate-12" />
					{APP_MESSAGE.NAME}
				</Link>
			</FadeIn>
			<div className="flex flex-1 items-center justify-center">
				<div className="w-full max-w-xs">{props.children}</div>
			</div>
		</div>
		<AuthShowcase />
	</div>
);
