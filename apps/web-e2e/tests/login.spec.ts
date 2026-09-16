import { expect, test } from "@playwright/test";
import { confirmAction } from "../support/confirm.ts";

test("signs in and creates a note", async ({ page }): Promise<void> => {
	await page.goto("/login");

	await page.getByLabel("Email").pressSequentially("admin@test.app");
	await page.getByLabel("Password").pressSequentially("Password123");
	await page.getByRole("button", { name: "Login" }).click();

	await expect(page).toHaveURL(/\/dashboard/);
	await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

	await page.goto("/notes");
	await page.getByPlaceholder("Title").fill("From Playwright");
	await page.getByRole("button", { name: "Add note" }).click();
	await confirmAction(page);

	await expect(page.getByText("From Playwright")).toBeVisible();
});
