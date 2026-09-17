import { NOTE_MESSAGE } from "@app/messages";
import { expect, type Page } from "@playwright/test";
import { confirmAction } from "./confirm.ts";

export const createNote = async (page: Page, title: string): Promise<void> => {
	await page.goto("/notes/create");
	await page.getByLabel(NOTE_MESSAGE.COLUMN_TITLE, { exact: true }).fill(title);
	await page.getByRole("button", { name: NOTE_MESSAGE.NEW_NOTE }).click();
	await confirmAction(page);
	await expect(page).toHaveURL(/\/notes(\?.*)?$/);
	await expect(page.getByText(title, { exact: true })).toBeVisible();
};
