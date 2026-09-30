import { Stagger, StaggerItem } from "@app/components/motion/stagger";
import { AUTH_MESSAGE } from "@app/messages";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { AccountSummary } from "#/routes/_authenticated/account/_components/account-summary.tsx";
import { PasswordChangeForm } from "#/routes/_authenticated/account/_components/password-change-form.tsx";
import { RouteSkeleton } from "#/routes/_components/route-skeleton.tsx";
import { PageHeaderSkeleton } from "@app/components/skeleton/page-header-skeleton";
import { FormSkeleton } from "@app/components/skeleton/form-skeleton";
import { CardSkeleton } from "@app/components/skeleton/card-grid-skeleton";

const AccountPage: FC = (): ReactElement => {
	return (
		<Stagger className="flex w-full flex-col gap-6">
			<StaggerItem>
				<h1 className="text-xl font-semibold">{AUTH_MESSAGE.ACCOUNT_TITLE}</h1>
			</StaggerItem>
			<StaggerItem>
				<AccountSummary />
			</StaggerItem>
			<StaggerItem>
				<PasswordChangeForm />
			</StaggerItem>
		</Stagger>
	);
};

const AccountPending: FC = (): ReactElement => (
	<RouteSkeleton>
		<PageHeaderSkeleton />
		<CardSkeleton className="h-32" />
		<FormSkeleton fields={3} footer={false} />
	</RouteSkeleton>
);

export const Route = createFileRoute("/_authenticated/account/")({
	component: AccountPage,
	pendingComponent: AccountPending,
});
