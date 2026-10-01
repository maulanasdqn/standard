import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { AuthLayout } from "#/routes/_components/auth-layout.tsx";
import { ForgotPasswordForm } from "#/routes/_public/forgot-password/_components/forgot-password-form.tsx";

const ForgotPasswordPage: FC = (): ReactElement => (
	<AuthLayout>
		<ForgotPasswordForm />
	</AuthLayout>
);

export const Route = createFileRoute("/_public/forgot-password/")({
	component: ForgotPasswordPage,
});
