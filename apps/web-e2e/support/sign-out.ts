import { AUTH_MESSAGE, NAV_MESSAGE } from "@app/messages";
import { expect, type Page } from "@playwright/test";

export const signOut = async (page: Page): Promise<void> => {
	await page
		.locator('[data-sidebar="footer"] [data-sidebar="menu-button"]')
		.click();
	await page.getByRole("menuitem", { name: NAV_MESSAGE.SIGN_OUT }).click();
	const dialog = page.getByRole("alertdialog", {
		name: AUTH_MESSAGE.SIGN_OUT_CONFIRM_TITLE,
	});
	await dialog.getByRole("button", { name: NAV_MESSAGE.SIGN_OUT }).click();
	await expect(page).toHaveURL(/\/login/);
};
