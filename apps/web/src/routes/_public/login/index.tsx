import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "#/routes/_public/login/_components/login-form.tsx";

export const Route = createFileRoute("/_public/login/")({
	component: LoginPage,
});

function LoginPage() {
	return (
		<div className="flex h-screen items-center justify-center">
			<LoginForm />
		</div>
	);
}
