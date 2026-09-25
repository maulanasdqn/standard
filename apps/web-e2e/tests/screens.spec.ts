import { ERROR_MESSAGE } from "@app/messages";
import { expect, type Page, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { signIn } from "../support/sign-in.ts";

test.describe.configure({ mode: "serial" });

test.describe("error screens", () => {
	let page: Page;

	test.beforeAll(async ({ browser }): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.viewer);
	});

	test.afterAll(async (): Promise<void> => {
		await page.close();
	});

	test("shows the not found screen for a route that does not exist", async (): Promise<void> => {
		await page.goto("/nowhere-at-all");

		await expect(
			page.getByRole("heading", { name: ERROR_MESSAGE.NOT_FOUND_TITLE }),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: ERROR_MESSAGE.GO_HOME }),
		).toBeVisible();
	});

	test("shows the forbidden screen on an admin page and keeps the address", async (): Promise<void> => {
		await page.goto("/roles");

		await expect(
			page.getByRole("heading", { name: ERROR_MESSAGE.FORBIDDEN_TITLE }),
		).toBeVisible();
		await expect(page).toHaveURL(/\/roles/);
	});

	test("takes the viewer back home from the not found screen", async (): Promise<void> => {
		await page.goto("/nowhere-at-all");
		await page.getByRole("link", { name: ERROR_MESSAGE.GO_HOME }).click();

		await expect(page).toHaveURL(/\/dashboard/);
	});
});
