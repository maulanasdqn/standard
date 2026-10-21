import { webPathOf } from "@app/contract";
import { BLOG_MESSAGE, LANDING_MESSAGE } from "@app/messages";
import { BLOG_PATH } from "./blog/paths.ts";

export const SECTION_ID = {
	MAIN: "main",
	FEATURES: "features",
	STACK: "stack",
	STEPS: "how-it-works",
	FAQ: "faq",
} as const;

export type TSectionId = (typeof SECTION_ID)[keyof typeof SECTION_ID];

export type TNavLink = {
	readonly href: string;
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

export const anchorOf = (id: TSectionId): string => `#${id}`;

const sectionLinkOf = (id: TSectionId, label: string): TNavLink => ({
	href: `${HOME_PATH}${anchorOf(id)}`,
	label,
});

export const NAV_LINKS: readonly TNavLink[] = [
	sectionLinkOf(SECTION_ID.FEATURES, LANDING_MESSAGE.NAV_FEATURES),
	sectionLinkOf(SECTION_ID.STACK, LANDING_MESSAGE.NAV_STACK),
	sectionLinkOf(SECTION_ID.STEPS, LANDING_MESSAGE.NAV_STEPS),
	sectionLinkOf(SECTION_ID.FAQ, LANDING_MESSAGE.NAV_FAQ),
	{ href: BLOG_PATH, label: BLOG_MESSAGE.NAV_BLOG },
];
