import { NOTE_MESSAGE, TABLE_MESSAGE } from "@app/messages";
import { expect, type Page, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { createNote } from "../support/notes.ts";
import { selectOption } from "../support/select.ts";
import { signIn } from "../support/sign-in.ts";

const FIRST_NOTE = "Alpha list note";
const LAST_NOTE = "Zulu list note";
const SEARCH_TEXT = "Zulu list";
const SMALLER_PAGE_SIZE = "10";

test.describe.configure({ mode: "serial" });

test.describe("the list keeps its state in the address", () => {
	let page: Page;

	test.beforeAll(async ({ browser }): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.admin);
		await createNote(page, FIRST_NOTE);
		await createNote(page, LAST_NOTE);
	});

	test.afterAll(async (): Promise<void> => {
		await page.close();
	});

	test("puts the search in the address and restores it after a reload", async (): Promise<void> => {
		await page.goto("/notes");
		const searchBox = page.getByLabel(NOTE_MESSAGE.SEARCH_PLACEHOLDER);
		await searchBox.fill(SEARCH_TEXT);
		await searchBox.press("Enter");

		await expect(page).toHaveURL(/search=Zulu\+list|search=Zulu%20list/);
		await expect(page.getByText(LAST_NOTE, { exact: true })).toBeVisible();
		await expect(page.getByText(FIRST_NOTE, { exact: true })).toHaveCount(0);

		await page.reload();

		await expect(page.getByLabel(NOTE_MESSAGE.SEARCH_PLACEHOLDER)).toHaveValue(
			SEARCH_TEXT,
		);
		await expect(page.getByText(LAST_NOTE, { exact: true })).toBeVisible();
	});

	test("puts the sort in the address and toggles its direction", async (): Promise<void> => {
		await page.goto("/notes");
		const titleSort = page.getByRole("button", {
			name: NOTE_MESSAGE.COLUMN_TITLE,
			exact: true,
		});

		await titleSort.click();
		await expect(page).toHaveURL(/sortBy=title/);
		await expect(page).toHaveURL(/sortDir=asc/);
		await expect(page.getByRole("row").nth(1)).toContainText(FIRST_NOTE);

		await titleSort.click();
		await expect(page).toHaveURL(/sortDir=desc/);
		await expect(page.getByRole("row").nth(1)).toContainText(LAST_NOTE);
	});

	test("puts the page size in the address and keeps it after a reload", async (): Promise<void> => {
		await page.goto("/notes");
		const pageSizeSelect = page
			.locator("div", { hasText: TABLE_MESSAGE.ROWS_PER_PAGE })
			.getByRole("combobox")
			.first();

		await selectOption(page, pageSizeSelect, SMALLER_PAGE_SIZE);

		await expect(page).toHaveURL(/pageSize=10/);

		await page.reload();

		await expect(
			page
				.locator("div", { hasText: TABLE_MESSAGE.ROWS_PER_PAGE })
				.getByRole("combobox")
				.first(),
		).toHaveText(SMALLER_PAGE_SIZE);
	});
});
