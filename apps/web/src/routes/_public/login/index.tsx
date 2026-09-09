import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { LoginForm } from "#/routes/_public/login/_components/login-form.tsx";

export const Route = createFileRoute("/_public/login/")({
	component: LoginPage,
});

function LoginPage(): ReactElement {
	return (
		<div className="flex h-screen items-center justify-center">
			<LoginForm />
		</div>
	);
}
