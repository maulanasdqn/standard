import { FadeIn } from "@app/components/motion/fade-in";
import { APP_MESSAGE } from "@app/messages";
import { loginSearchSchema } from "@app/schemas";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { AppLogo } from "#/routes/_components/app-logo.tsx";
import { LoginForm } from "#/routes/_public/login/_components/login-form.tsx";
import { LoginShowcase } from "#/routes/_public/login/_components/login-showcase.tsx";

const LoginPage: FC = (): ReactElement => {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<FadeIn className="flex justify-center gap-2 md:justify-start">
					<Link to="/" className="group flex items-center gap-2 font-medium">
						<AppLogo className="size-6 transition-transform duration-300 group-hover:rotate-12" />
						{APP_MESSAGE.NAME}
					</Link>
				</FadeIn>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<LoginForm />
					</div>
				</div>
			</div>
			<LoginShowcase />
		</div>
	);
};

export const Route = createFileRoute("/_public/login/")({
	validateSearch: loginSearchSchema,
	component: LoginPage,
});
