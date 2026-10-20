import { webPathOf } from "@app/contract";
import { LANDING_MESSAGE } from "@app/messages";

export const SECTION_ID = {
	MAIN: "main",
	FEATURES: "features",
	STACK: "stack",
	STEPS: "how-it-works",
	FAQ: "faq",
} as const;

export type TSectionId = (typeof SECTION_ID)[keyof typeof SECTION_ID];

export type TNavLink = {
	readonly id: TSectionId;
	readonly label: string;
};

const WEB_ROUTE = {
	LOGIN: "/login",
	REGISTER: "/register",
} as const;

export const HOME_PATH = "/";

export const APP_LINK = {
	SIGN_IN: webPathOf(WEB_ROUTE.LOGIN),
	GET_STARTED: webPathOf(WEB_ROUTE.REGISTER),
} as const;

export const NAV_LINKS: readonly TNavLink[] = [
	{ id: SECTION_ID.FEATURES, label: LANDING_MESSAGE.NAV_FEATURES },
	{ id: SECTION_ID.STACK, label: LANDING_MESSAGE.NAV_STACK },
	{ id: SECTION_ID.STEPS, label: LANDING_MESSAGE.NAV_STEPS },
	{ id: SECTION_ID.FAQ, label: LANDING_MESSAGE.NAV_FAQ },
];

export const anchorOf = (id: TSectionId): string => `#${id}`;
