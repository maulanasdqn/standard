import { FadeIn } from "@app/components/motion/fade-in";
import { Stagger, StaggerItem } from "@app/components/motion/stagger";
import { CardSkeleton } from "@app/components/skeleton/card-grid-skeleton";
import { FormSkeleton } from "@app/components/skeleton/form-skeleton";
import { PageHeaderSkeleton } from "@app/components/skeleton/page-header-skeleton";
import { Tabs, TabsContent, TabsList } from "@app/components/ui/tabs";
import { AUTH_MESSAGE } from "@app/messages";
import { createFileRoute } from "@tanstack/react-router";
import { MonitorSmartphone, ShieldCheck, UserRound } from "lucide-react";
import type { FC, ReactElement } from "react";
import { AccountSummary } from "#/routes/_authenticated/account/_components/account-summary.tsx";
import { AccountTabTrigger } from "#/routes/_authenticated/account/_components/account-tab-trigger.tsx";
import { PasswordChangeForm } from "#/routes/_authenticated/account/_components/password-change-form.tsx";
import { ProfileForm } from "#/routes/_authenticated/account/_components/profile-form.tsx";
import { SessionsCard } from "#/routes/_authenticated/account/_components/sessions-card.tsx";
import { TwoFactorCard } from "#/routes/_authenticated/account/_components/two-factor-card.tsx";
import {
	ACCOUNT_TAB,
	accountSearchSchema,
} from "#/routes/_authenticated/account/_constants/account-tab.ts";
import { useAccountTab } from "#/routes/_authenticated/account/_hooks/use-account-tab.ts";
import { RouteSkeleton } from "#/routes/_components/route-skeleton.tsx";

const AccountPage: FC = (): ReactElement => {
	const { tab, onTabChange } = useAccountTab();

	return (
		<Stagger className="flex w-full flex-col gap-6">
			<StaggerItem>
				<h1 className="text-xl font-semibold">{AUTH_MESSAGE.ACCOUNT_TITLE}</h1>
			</StaggerItem>
			<StaggerItem>
				<Tabs value={tab} onValueChange={onTabChange}>
					<TabsList>
						<AccountTabTrigger
							value={ACCOUNT_TAB.PROFILE}
							active={tab}
							label={AUTH_MESSAGE.ACCOUNT_TAB_PROFILE}
							icon={UserRound}
						/>
						<AccountTabTrigger
							value={ACCOUNT_TAB.SECURITY}
							active={tab}
							label={AUTH_MESSAGE.ACCOUNT_TAB_SECURITY}
							icon={ShieldCheck}
						/>
						<AccountTabTrigger
							value={ACCOUNT_TAB.SESSIONS}
							active={tab}
							label={AUTH_MESSAGE.ACCOUNT_TAB_SESSIONS}
							icon={MonitorSmartphone}
						/>
					</TabsList>
					<TabsContent value={ACCOUNT_TAB.PROFILE}>
						<FadeIn className="flex flex-col gap-6">
							<AccountSummary />
							<ProfileForm />
						</FadeIn>
					</TabsContent>
					<TabsContent value={ACCOUNT_TAB.SECURITY}>
						<FadeIn className="flex flex-col gap-6">
							<PasswordChangeForm />
							<TwoFactorCard />
						</FadeIn>
					</TabsContent>
					<TabsContent value={ACCOUNT_TAB.SESSIONS}>
						<FadeIn>
							<SessionsCard />
						</FadeIn>
					</TabsContent>
				</Tabs>
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
	validateSearch: accountSearchSchema,
	component: AccountPage,
	pendingComponent: AccountPending,
});
