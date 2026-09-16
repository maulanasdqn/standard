import { expect, type Page, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { signIn } from "../support/sign-in.ts";

const ADD_NOTE = "Add note";
const TITLE_PLACEHOLDER = "Title";
const WRITER_NOTE = "Written by a note:write holder";

test.describe.configure({ mode: "serial" });

test.describe("note write affordances follow the permission", () => {
	let page: Page;

	test.afterEach(async (): Promise<void> => {
		await page.close();
	});

	test("a viewer reads notes without being offered the create form", async ({
		browser,
	}): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.viewer);

		await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();

		await expect(page.getByRole("button", { name: ADD_NOTE })).toHaveCount(0);
		await expect(page.getByPlaceholder(TITLE_PLACEHOLDER)).toHaveCount(0);
	});

	test("a note:write holder is offered the create form and can use it", async ({
		browser,
	}): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.admin);

		await expect(page.getByPlaceholder(TITLE_PLACEHOLDER)).toBeVisible();

		await page.getByPlaceholder(TITLE_PLACEHOLDER).fill(WRITER_NOTE);
		await page.getByRole("button", { name: ADD_NOTE }).click();

		await expect(page.getByText(WRITER_NOTE)).toBeVisible();
	});
});
