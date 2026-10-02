import { SIGN_UP_ENABLED } from "@app/schemas";
import { createFileRoute, redirect } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { match, P } from "ts-pattern";
import { AuthLayout } from "#/routes/_components/auth-layout.tsx";
import { CheckEmail } from "#/routes/_public/register/_components/check-email.tsx";
import { RegisterForm } from "#/routes/_public/register/_components/register-form.tsx";
import { useRegisterForm } from "#/routes/_public/register/_hooks/use-register-form.ts";

const RegisterPage: FC = (): ReactElement => {
	const register = useRegisterForm();

	return (
		<AuthLayout>
			{match(register.sentTo)
				.with(P.string, (email) => <CheckEmail email={email} />)
				.otherwise(() => (
					<RegisterForm register={register} />
				))}
		</AuthLayout>
	);
};

export const Route = createFileRoute("/_public/register/")({
	beforeLoad: (): void => {
		match(SIGN_UP_ENABLED)
			.with(false, () => {
				throw redirect({ to: "/login" });
			})
			.otherwise(() => undefined);
	},
	component: RegisterPage,
});
