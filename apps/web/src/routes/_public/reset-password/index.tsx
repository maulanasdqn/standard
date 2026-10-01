import { resetPasswordSearchSchema } from "@app/schemas";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { match, P } from "ts-pattern";
import { AuthLayout } from "#/routes/_components/auth-layout.tsx";
import { ResetLinkInvalid } from "#/routes/_public/reset-password/_components/reset-link-invalid.tsx";
import { ResetPasswordPanel } from "#/routes/_public/reset-password/_components/reset-password-panel.tsx";

const ResetPasswordPage: FC = (): ReactElement => {
	const search = Route.useSearch();

	return (
		<AuthLayout>
			{match(search)
				.with({ error: P.string }, () => <ResetLinkInvalid />)
				.with({ token: P.string }, (found) => (
					<ResetPasswordPanel token={found.token} />
				))
				.otherwise(() => (
					<ResetLinkInvalid />
				))}
		</AuthLayout>
	);
};

export const Route = createFileRoute("/_public/reset-password/")({
	validateSearch: resetPasswordSearchSchema,
	component: ResetPasswordPage,
});
