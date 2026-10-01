import { loginSearchSchema } from "@app/schemas";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { AuthLayout } from "#/routes/_components/auth-layout.tsx";
import { LoginForm } from "#/routes/_public/login/_components/login-form.tsx";

const LoginPage: FC = (): ReactElement => (
	<AuthLayout>
		<LoginForm />
	</AuthLayout>
);

export const Route = createFileRoute("/_public/login/")({
	validateSearch: loginSearchSchema,
	component: LoginPage,
});
