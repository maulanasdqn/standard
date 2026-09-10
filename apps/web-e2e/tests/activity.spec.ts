import { ACTIVITY_ACTION } from "@app/activity";
import { expect, type Page, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { expectNavHidden, NAV_LABEL } from "../support/nav.ts";
import { signIn } from "../support/sign-in.ts";
import { signOut } from "../support/sign-out.ts";

const NOTE_TITLE = "Audited from Playwright";

test.describe.configure({ mode: "serial" });

test.describe("activity log", () => {
	let page: Page;

	test.beforeAll(async ({ browser }): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.admin);
	});

	test.afterAll(async (): Promise<void> => {
		await page.close();
	});

	test("records a note creation attributed to the admin", async (): Promise<void> => {
		await page.getByPlaceholder("Title").fill(NOTE_TITLE);
		await page.getByRole("button", { name: "Add note" }).click();
		await expect(page.getByText(NOTE_TITLE)).toBeVisible();

		await page.goto("/activity");
		await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();

		await page
			.getByLabel("Action", { exact: true })
			.selectOption(ACTIVITY_ACTION.NOTE_CREATE);
		await expect(page).toHaveURL(/action=note\.create/);

		const entry = page
			.getByRole("row")
			.filter({ hasText: SEED_CREDENTIALS.admin.email })
			.filter({ hasText: ACTIVITY_ACTION.NOTE_CREATE })
			.first();
		await expect(entry).toBeVisible();
	});

	test("is hidden from a viewer", async (): Promise<void> => {
		await signOut(page);
		await signIn(page, SEED_CREDENTIALS.viewer);

		await expectNavHidden(page, [NAV_LABEL.ACTIVITY]);

		await page.goto("/activity");
		await expect(page).toHaveURL(/\/notes/);
	});
});
