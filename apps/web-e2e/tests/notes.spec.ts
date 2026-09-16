import { expect, type Page, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { signIn } from "../support/sign-in.ts";
import { confirmAction } from "../support/confirm.ts";

const NEW_NOTE = "New Note";
const WRITER_NOTE = "Written by a note:write holder";

test.describe.configure({ mode: "serial" });

test.describe("note write affordances follow the permission", () => {
	let page: Page;

	test.afterEach(async (): Promise<void> => {
		await page.close();
	});

	test("a viewer reads notes without being offered the create button", async ({
		browser,
	}): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.viewer);

		await page.goto("/notes");
		await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();

		await expect(
			page.getByRole("link", { name: NEW_NOTE }),
		).toHaveCount(0);
	});

	test("a note:write holder can create a note from the dedicated page", async ({
		browser,
	}): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.admin);

		await page.goto("/notes");
		await page.getByRole("link", { name: NEW_NOTE }).click();

		await expect(page).toHaveURL(/\/notes\/create/);

		await page.getByLabel("Title").fill(WRITER_NOTE);
		await page.getByRole("button", { name: NEW_NOTE }).click();
		await confirmAction(page);

		await expect(page).toHaveURL(/\/notes/);
		await expect(page.getByText(WRITER_NOTE)).toBeVisible();
	});
});
