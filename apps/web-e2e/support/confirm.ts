import { APP_MESSAGE } from "@app/messages";
import type { Page } from "@playwright/test";

export const confirmAction = async (
	page: Page,
	label: string = APP_MESSAGE.CONFIRM,
): Promise<void> => {
	await page
		.getByRole("alertdialog")
		.getByRole("button", { name: label, exact: true })
		.click();
};
