import { APP_MESSAGE } from "@app/messages";
import type { Locator, Page } from "@playwright/test";

export const deleteFromRow = async (
	page: Page,
	row: Locator,
): Promise<void> => {
	await row.getByRole("button", { name: APP_MESSAGE.DELETE }).click();
	await page
		.getByRole("alertdialog")
		.getByRole("button", { name: APP_MESSAGE.DELETE })
		.click();
};

export const deleteButtonOf = (row: Locator): Locator =>
	row.getByRole("button", { name: APP_MESSAGE.DELETE });
