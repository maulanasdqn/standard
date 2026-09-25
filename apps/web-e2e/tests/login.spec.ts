import { AUTH_MESSAGE } from "@app/messages";
import { expect, test } from "@playwright/test";
import { createNote } from "../support/notes.ts";

test("signs in and creates a note", async ({ page }): Promise<void> => {
	await page.goto("/login");

	await page
		.getByLabel(AUTH_MESSAGE.FIELD_EMAIL)
		.pressSequentially("admin@test.app");
	await page
		.getByLabel(AUTH_MESSAGE.FIELD_PASSWORD)
		.pressSequentially("Password123");
	await page.getByRole("button", { name: AUTH_MESSAGE.LOGIN_ACTION }).click();

	await expect(page).toHaveURL(/\/dashboard/);
	await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

	await createNote(page, "From Playwright");
});

test("returns to the page that asked for sign-in", async ({
	page,
}): Promise<void> => {
	await page.goto("/notes?page=2");
	await expect(page).toHaveURL(/\/login\?redirect=/);

	await page
		.getByLabel(AUTH_MESSAGE.FIELD_EMAIL)
		.pressSequentially("admin@test.app");
	await page
		.getByLabel(AUTH_MESSAGE.FIELD_PASSWORD)
		.pressSequentially("Password123");
	await page.getByRole("button", { name: AUTH_MESSAGE.LOGIN_ACTION }).click();

	await expect(page).toHaveURL(/\/notes\?page=2(&|$)/);
	await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();
});
