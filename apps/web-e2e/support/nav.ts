import { expect, type Locator, type Page } from "@playwright/test";

export const NAV_LABEL = {
	NOTES: "Notes",
	USERS: "Users",
	ROLES: "Roles",
	PERMISSIONS: "Permissions",
	ACTIVITY: "Activity",
	ACCOUNT: "Account",
} as const;

export const ADMIN_NAV_LABELS: readonly string[] = [
	NAV_LABEL.USERS,
	NAV_LABEL.ROLES,
	NAV_LABEL.PERMISSIONS,
	NAV_LABEL.ACTIVITY,
];

const navLink = (page: Page, label: string): Locator =>
	page.getByRole("navigation").getByRole("link", { name: label, exact: true });

export const expectNavVisible = async (
	page: Page,
	labels: readonly string[],
): Promise<void> => {
	await Promise.all(
		labels.map((label) => expect(navLink(page, label)).toBeVisible()),
	);
};

export const expectNavHidden = async (
	page: Page,
	labels: readonly string[],
): Promise<void> => {
	await Promise.all(
		labels.map((label) => expect(navLink(page, label)).toHaveCount(0)),
	);
};
