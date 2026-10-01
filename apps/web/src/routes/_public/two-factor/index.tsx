import { twoFactorSearchSchema } from "@app/schemas";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { AuthLayout } from "#/routes/_components/auth-layout.tsx";
import { TwoFactorForm } from "#/routes/_public/two-factor/_components/two-factor-form.tsx";

const TwoFactorPage: FC = (): ReactElement => (
	<AuthLayout>
		<TwoFactorForm />
	</AuthLayout>
);

export const Route = createFileRoute("/_public/two-factor/")({
	validateSearch: twoFactorSearchSchema,
	component: TwoFactorPage,
});
