import { expect, type Page } from "@playwright/test";

export const signOut = async (page: Page): Promise<void> => {
	await page.getByRole("button", { name: "Sign out" }).click();
	await expect(page).toHaveURL(/\/login/);
};
