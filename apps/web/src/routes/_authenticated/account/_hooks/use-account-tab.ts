import { getRouteApi } from "@tanstack/react-router";
import { match } from "ts-pattern";
import {
	ACCOUNT_TAB,
	type TAccountTab,
} from "#/routes/_authenticated/account/_constants/account-tab.ts";

const accountRouteApi = getRouteApi("/_authenticated/account/");

export type TAccountTabState = {
	tab: TAccountTab;
	onTabChange: (next: string) => void;
};

const tabOf = (value: string): TAccountTab =>
	match(value)
		.with(ACCOUNT_TAB.SECURITY, (): TAccountTab => ACCOUNT_TAB.SECURITY)
		.with(ACCOUNT_TAB.SESSIONS, (): TAccountTab => ACCOUNT_TAB.SESSIONS)
		.otherwise((): TAccountTab => ACCOUNT_TAB.PROFILE);

export const useAccountTab = (): TAccountTabState => {
	const navigate = accountRouteApi.useNavigate();
	const { tab } = accountRouteApi.useSearch();

	return {
		tab: tab ?? ACCOUNT_TAB.PROFILE,
		onTabChange: (next: string): void =>
			void navigate({ search: { tab: tabOf(next) }, replace: true }),
	};
};
