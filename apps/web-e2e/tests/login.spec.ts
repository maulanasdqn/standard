import { expect, test } from "@playwright/test";
import { createNote } from "../support/notes.ts";

test("signs in and creates a note", async ({ page }): Promise<void> => {
	await page.goto("/login");

	await page.getByLabel("Email").pressSequentially("admin@test.app");
	await page.getByLabel("Password").pressSequentially("Password123");
	await page.getByRole("button", { name: "Login" }).click();

	await expect(page).toHaveURL(/\/dashboard/);
	await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

	await createNote(page, "From Playwright");
});

test("returns to the page that asked for sign-in", async ({
	page,
}): Promise<void> => {
	await page.goto("/notes?page=2");
	await expect(page).toHaveURL(/\/login\?redirect=/);

	await page.getByLabel("Email").pressSequentially("admin@test.app");
	await page.getByLabel("Password").pressSequentially("Password123");
	await page.getByRole("button", { name: "Login" }).click();

	await expect(page).toHaveURL(/\/notes\?page=2(&|$)/);
	await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();
});
