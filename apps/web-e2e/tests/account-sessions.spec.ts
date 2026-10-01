import { AUTH_MESSAGE } from "@app/messages";
import { expect, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { signIn } from "../support/sign-in.ts";

const ORIGINAL_NAME = "Viewer";
const RENAMED = "Viewer Renamed";

test("a user renames themselves and signs another device out", async ({
	browser,
}): Promise<void> => {
	const otherDevice = await browser.newPage();
	await signIn(otherDevice, SEED_CREDENTIALS.viewer);
	const page = await browser.newPage();
	await signIn(page, SEED_CREDENTIALS.viewer);

	await page.goto("/account");
	const name = page.getByLabel(AUTH_MESSAGE.FIELD_NAME, { exact: true });
	await name.clear();
	await name.pressSequentially(RENAMED);
	await page.getByRole("button", { name: AUTH_MESSAGE.PROFILE_SAVE }).click();
	await expect(page.getByText(AUTH_MESSAGE.PROFILE_SAVED)).toBeVisible();
	await expect(
		page.getByRole("definition").filter({ hasText: RENAMED }),
	).toBeVisible();

	await page
		.getByRole("tab", { name: AUTH_MESSAGE.ACCOUNT_TAB_SESSIONS })
		.click();
	await expect(page.getByText(AUTH_MESSAGE.SESSION_THIS_DEVICE)).toBeVisible();
	await page
		.getByRole("button", { name: AUTH_MESSAGE.SESSION_REVOKE_OTHERS })
		.click();
	await expect(page.getByText(AUTH_MESSAGE.SESSIONS_REVOKED)).toBeVisible();

	await otherDevice.reload();
	await expect(otherDevice).toHaveURL(/\/login/);

	await page
		.getByRole("tab", { name: AUTH_MESSAGE.ACCOUNT_TAB_PROFILE })
		.click();
	await name.clear();
	await name.pressSequentially(ORIGINAL_NAME);
	await page.getByRole("button", { name: AUTH_MESSAGE.PROFILE_SAVE }).click();
	await expect(
		page.getByText(AUTH_MESSAGE.PROFILE_SAVED).first(),
	).toBeVisible();
});
