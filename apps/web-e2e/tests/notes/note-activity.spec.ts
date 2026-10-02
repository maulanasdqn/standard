import { TABLE_MESSAGE } from "@app/messages";
import { ACTIVITY_ACTION } from "@app/activity";
import { ACTIVITY_ACTION_LABEL } from "@app/messages";
import { expect, type Page, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../../support/credentials.ts";
import { signIn } from "../../support/sign-in.ts";
import { selectOption } from "../../support/select.ts";
import { createNote } from "./notes-support.ts";

const NOTE_TITLE = "Audited from Playwright";

test.describe.configure({ mode: "serial" });

test.describe("note activity", () => {
	let page: Page;

	test.beforeAll(async ({ browser }): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.admin);
	});

	test.afterAll(async (): Promise<void> => {
		await page.close();
	});

	test("records a note creation attributed to the admin", async (): Promise<void> => {
		await createNote(page, NOTE_TITLE);

		await page.goto("/activity");
		await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();

		await page.getByRole("button", { name: TABLE_MESSAGE.FILTERS }).click();
		await selectOption(
			page,
			page.getByLabel("Action", { exact: true }),
			ACTIVITY_ACTION_LABEL[ACTIVITY_ACTION.NOTE_CREATE],
		);
		await page
			.getByRole("button", { name: TABLE_MESSAGE.FILTER_APPLY })
			.click();
		await expect(page).toHaveURL(/action=note\.create/);

		const entry = page
			.getByRole("row")
			.filter({ hasText: SEED_CREDENTIALS.admin.email })
			.filter({ hasText: ACTIVITY_ACTION_LABEL[ACTIVITY_ACTION.NOTE_CREATE] })
			.first();
		await expect(entry).toBeVisible();
	});
});
