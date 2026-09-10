import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { AccountSummary } from "#/routes/_authenticated/account/_components/account-summary.tsx";
import { PasswordChangeForm } from "#/routes/_authenticated/account/_components/password-change-form.tsx";

export const Route = createFileRoute("/_authenticated/account/")({
	component: AccountPage,
});

function AccountPage(): ReactElement {
	return (
		<div className="flex max-w-md flex-col gap-6">
			<h1 className="text-xl font-semibold">Account</h1>
			<AccountSummary />
			<PasswordChangeForm />
		</div>
	);
}
