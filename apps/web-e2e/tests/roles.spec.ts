import type { TRoleCreateInput, TUserCreateInput } from "@app/schemas";
import { expect, type Page, test } from "@playwright/test";
import {
	FIXED_ROLE_KEYS,
	PERMISSION_KEY,
	PERMISSION_LABEL,
	ROLE_KEY,
} from "../support/access.ts";
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

const FIXED_NOTICE =
	"Fixed roles are defined in code and can't be changed here.";

const NEW_ROLE: TRoleCreateInput = {
	key: "e2e-reviewer",
	label: "Reviewer",
	description: "Reads notes, nothing else.",
	permissions: [PERMISSION_KEY.NOTE_READ],
};
const RENAMED_LABEL = "Reviewer Plus";

const REVIEWER: TUserCreateInput = {
	name: "E2E Reviewer",
	email: "e2e-reviewer@app.test",
	password: "reviewer-password-123",
	role: NEW_ROLE.key,
};

test.describe.configure({ mode: "serial" });

test.describe("roles admin flow", () => {
	let page: Page;

	test.beforeAll(async ({ browser }): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.admin);
	});

	test.afterAll(async (): Promise<void> => {
		await page.close();
	});

	test("marks the fixed roles and keeps their edit page read-only", async (): Promise<void> => {
		await page.goto("/roles");
		await expect(page.getByRole("heading", { name: "Roles" })).toBeVisible();

		await Promise.all(
			FIXED_ROLE_KEYS.map((key) =>
				expect(rowWithCell(page, key).getByText("Fixed")).toBeVisible(),
			),
		);

		await rowWithCell(page, ROLE_KEY.ADMIN)
			.getByRole("link", { name: "View" })
			.click();
		await expect(page).toHaveURL(new RegExp(`/roles/${ROLE_KEY.ADMIN}$`));

		await expect(page.getByText(FIXED_NOTICE)).toBeVisible();
		await expect(page.getByLabel("Label", { exact: true })).toBeDisabled();
		await expect(page.getByRole("checkbox").first()).toBeDisabled();
		await expect(
			page.getByRole("button", { name: "Save changes" }),
		).toHaveCount(0);
	});

	test("creates a custom role with a single permission", async (): Promise<void> => {
		await page.goto("/roles");

		await page.getByLabel("Key", { exact: true }).fill(NEW_ROLE.key);
		await page.getByLabel("Label", { exact: true }).fill(NEW_ROLE.label);
		await page
			.getByLabel("Description", { exact: true })
			.fill(NEW_ROLE.description ?? "");
		await page
			.getByRole("checkbox", {
				name: PERMISSION_LABEL[PERMISSION_KEY.NOTE_READ],
			})
			.check();
		await page.getByRole("button", { name: "Create role" }).click();

		const row = rowWithCell(page, NEW_ROLE.key);
		await expect(row).toContainText(NEW_ROLE.label);
		await expect(row.getByText("Fixed")).toHaveCount(0);
		await expect(
			row.getByRole("cell", { name: "1", exact: true }),
		).toBeVisible();
	});

	test("edits the custom role's label and grants note:write", async (): Promise<void> => {
		await rowWithCell(page, NEW_ROLE.key)
			.getByRole("link", { name: "Edit" })
			.click();
		await expect(page).toHaveURL(new RegExp(`/roles/${NEW_ROLE.key}$`));
		await expect(
			page.getByRole("heading", { name: NEW_ROLE.label }),
		).toBeVisible();
		await expect(page.getByText(FIXED_NOTICE)).toHaveCount(0);

		await page.getByLabel("Label", { exact: true }).fill(RENAMED_LABEL);
		await page
			.getByRole("checkbox", {
				name: PERMISSION_LABEL[PERMISSION_KEY.NOTE_WRITE],
			})
			.check();
		await page.getByRole("button", { name: "Save changes" }).click();

		await expect(page).toHaveURL(/\/roles$/);
		const row = rowWithCell(page, NEW_ROLE.key);
		await expect(row).toContainText(RENAMED_LABEL);
		await expect(
			row.getByRole("cell", { name: "2", exact: true }),
		).toBeVisible();
	});

	test("assigns the custom role to a new user", async (): Promise<void> => {
		await page.goto("/users");

		await page.getByLabel("Name", { exact: true }).fill(REVIEWER.name);
		await page.getByLabel("Email", { exact: true }).fill(REVIEWER.email);
		await page.getByLabel("Password", { exact: true }).fill(REVIEWER.password);
		await page.getByLabel("Role", { exact: true }).selectOption(REVIEWER.role);
		await page.getByRole("button", { name: "Create user" }).click();

		await expect(page.getByLabel(`Role for ${REVIEWER.name}`)).toHaveValue(
			NEW_ROLE.key,
		);
	});

	test("the reviewer gets exactly the custom role's permissions", async (): Promise<void> => {
		await signOut(page);
		await signIn(page, { email: REVIEWER.email, password: REVIEWER.password });

		await expectNavVisible(page, [NAV_LABEL.NOTES, NAV_LABEL.ACCOUNT]);
		await expectNavHidden(page, ADMIN_NAV_LABELS);

		await page.getByPlaceholder("Title").fill("Reviewer note");
		await page.getByRole("button", { name: "Add note" }).click();
		await expect(page.getByText("Reviewer note")).toBeVisible();

		await page.goto("/roles");
		await expect(page).toHaveURL(/\/notes/);
	});
});
