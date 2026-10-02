import { APP_MESSAGE } from "@app/messages";
import type { Locator, Page } from "@playwright/test";
import { confirmAction } from "./confirm.ts";
import { chooseRowAction, openRowMenu } from "./row-menu.ts";

export const deleteFromRow = async (
	page: Page,
	row: Locator,
): Promise<void> => {
	await chooseRowAction(page, row, APP_MESSAGE.DELETE);
	await confirmAction(page, APP_MESSAGE.DELETE);
};

export const deleteItemOf = async (
	page: Page,
	row: Locator,
): Promise<Locator> =>
	(await openRowMenu(page, row)).getByRole("menuitem", {
		name: APP_MESSAGE.DELETE,
	});
