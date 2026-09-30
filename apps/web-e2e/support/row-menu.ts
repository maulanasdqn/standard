import { APP_MESSAGE } from "@app/messages";
import type { Locator, Page } from "@playwright/test";

const CLOSE_KEY = "Escape";

export const openRowMenu = async (
	page: Page,
	row: Locator,
): Promise<Locator> => {
	await row.getByRole("button", { name: APP_MESSAGE.ROW_ACTIONS }).click();
	return page.getByRole("menu");
};

export const closeRowMenu = async (page: Page): Promise<void> => {
	await page.keyboard.press(CLOSE_KEY);
	await page.getByRole("menu").waitFor({ state: "detached" });
};

export const chooseRowAction = async (
	page: Page,
	row: Locator,
	action: string,
): Promise<void> => {
	const menu = await openRowMenu(page, row);
	await menu.getByRole("menuitem", { name: action }).click();
};
