import { ERROR_MESSAGE } from "@app/messages";
import { expect, test } from "@playwright/test";
import { ROLE_KEY, ROLE_LABEL } from "../support/access.ts";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import {
	ADMIN_NAV_LABELS,
	expectNavHidden,
	expectNavVisible,
	NAV_LABEL,
} from "../support/nav.ts";
import { signIn } from "../support/sign-in.ts";
import { signOut } from "../support/sign-out.ts";

test("a second account signed in after a sign-out sees only its own data", async ({
	page,
}): Promise<void> => {
	await signIn(page, SEED_CREDENTIALS.admin);
	await page.goto("/users");
	await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
	await page.goto("/account");
	await expect(page.getByRole("main").locator("dl")).toContainText(
		SEED_CREDENTIALS.admin.email,
	);

	await signOut(page);
	await signIn(page, SEED_CREDENTIALS.viewer);

	await expectNavVisible(page, [
		NAV_LABEL.DASHBOARD,
		NAV_LABEL.NOTES,
		NAV_LABEL.ACCOUNT,
	]);
	await expectNavHidden(page, ADMIN_NAV_LABELS);

	await page.goto("/account");
	const summary = page.getByRole("main").locator("dl");
	await expect(summary).toContainText(SEED_CREDENTIALS.viewer.email);
	await expect(summary).toContainText(ROLE_LABEL[ROLE_KEY.VIEWER]);
	await expect(summary).not.toContainText(SEED_CREDENTIALS.admin.email);

	await page.goto("/users");
	await expect(
		page.getByRole("heading", { name: ERROR_MESSAGE.FORBIDDEN_TITLE }),
	).toBeVisible();
});
