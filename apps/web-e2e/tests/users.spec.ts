import { USER_MESSAGE } from "@app/messages";
import type { TUserCreateInput } from "@app/schemas";
import { expect, type Page, test } from "@playwright/test";
import { ROLE_KEY } from "../support/access.ts";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import {
	ADMIN_NAV_LABELS,
	expectNavHidden,
	expectNavVisible,
	NAV_LABEL,
} from "../support/nav.ts";
import { signIn } from "../support/sign-in.ts";
import { signOut } from "../support/sign-out.ts";
import { rowWithCell } from "../support/table.ts";

const NEW_USER: TUserCreateInput = {
	name: "E2E User",
	email: "e2e-user@test.app",
	password: "e2e-password-123",
	role: ROLE_KEY.MEMBER,
};
const RENAMED = "E2E Renamed";
const RESET_PASSWORD = "e2e-reset-456";

test.describe.configure({ mode: "serial" });

test.describe("users admin flow", () => {
	let page: Page;

	test.beforeAll(async ({ browser }): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.admin);
	});

	test.afterAll(async (): Promise<void> => {
		await page.close();
	});

	test("creates a user from the form", async (): Promise<void> => {
		await page.goto("/users");
		await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();

		await page.getByLabel("Name", { exact: true }).fill(NEW_USER.name);
		await page.getByLabel("Email", { exact: true }).fill(NEW_USER.email);
		await page.getByLabel("Password", { exact: true }).fill(NEW_USER.password);
		await page.getByLabel("Role", { exact: true }).selectOption(NEW_USER.role);
		await page.getByRole("button", { name: "Create user" }).click();

		const row = rowWithCell(page, NEW_USER.email);
		await expect(row).toBeVisible();
		await expect(row).toContainText(NEW_USER.name);
	});

	test("changes the role inline", async (): Promise<void> => {
		const roleSelect = page.getByLabel(`Role for ${NEW_USER.name}`);
		await expect(roleSelect).toHaveValue(ROLE_KEY.MEMBER);

		await roleSelect.selectOption(ROLE_KEY.VIEWER);

		await expect(roleSelect).toHaveValue(ROLE_KEY.VIEWER);
	});

	test("renames the user from the edit page", async (): Promise<void> => {
		await rowWithCell(page, NEW_USER.email)
			.getByRole("link", { name: "Edit" })
			.click();
		await expect(
			page.getByRole("heading", { name: "Edit user" }),
		).toBeVisible();

		await page.getByLabel("Name", { exact: true }).fill(RENAMED);
		await page.getByRole("button", { name: "Save changes" }).click();

		await expect(page).toHaveURL(/\/users(\?.*)?$/);
		await expect(rowWithCell(page, NEW_USER.email)).toContainText(RENAMED);
	});

	test("resets the user's password", async (): Promise<void> => {
		await rowWithCell(page, NEW_USER.email)
			.getByRole("link", { name: "Edit" })
			.click();
		await expect(
			page.getByRole("heading", { name: "Edit user" }),
		).toBeVisible();

		await page.getByLabel("New password").fill(RESET_PASSWORD);
		await page.getByRole("button", { name: "Reset password" }).click();

		await expect(page.getByText(USER_MESSAGE.PASSWORD_RESET)).toBeVisible();
	});

	test("the user signs in with the new password and sees only viewer pages", async (): Promise<void> => {
		await signOut(page);
		await signIn(page, { email: NEW_USER.email, password: RESET_PASSWORD });

		await expectNavVisible(page, [NAV_LABEL.NOTES, NAV_LABEL.ACCOUNT]);
		await expectNavHidden(page, ADMIN_NAV_LABELS);

		await page.goto("/users");
		await expect(page).toHaveURL(/\/notes/);
	});
});
