import { expect, test } from "@playwright/test";

test("signs in and creates a note", async ({ page }): Promise<void> => {
	await page.goto("/login");

	await page.getByLabel("Email").fill("admin@test.app");
	await page.getByLabel("Password").fill("Password123");
	await page.getByRole("button", { name: "Sign in" }).click();

	await expect(page).toHaveURL(/\/notes/);
	await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();

	await page.getByPlaceholder("Title").fill("From Playwright");
	await page.getByRole("button", { name: "Add note" }).click();

	await expect(page.getByText("From Playwright")).toBeVisible();
});
