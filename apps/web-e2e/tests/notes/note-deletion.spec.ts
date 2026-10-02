import { NOTE_MESSAGE } from "@app/messages";
import { expect, type Page, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../../support/credentials.ts";
import { deleteFromRow } from "../../support/delete.ts";
import { signIn } from "../../support/sign-in.ts";
import { createNote } from "./notes-support.ts";

const DOOMED_NOTE = "Doomed note";

test.describe("deleting a note", () => {
	let page: Page;

	test.beforeAll(async ({ browser }): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.admin);
	});

	test.afterAll(async (): Promise<void> => {
		await page.close();
	});

	test("deletes a note after the confirmation", async (): Promise<void> => {
		await createNote(page, DOOMED_NOTE);

		await deleteFromRow(page, page.getByRole("row", { name: DOOMED_NOTE }));

		await expect(page.getByText(NOTE_MESSAGE.DELETED)).toBeVisible();
		await expect(page.getByText(DOOMED_NOTE, { exact: true })).toHaveCount(0);
	});
});
