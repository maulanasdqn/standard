import { webPathOf } from "@app/contract";
import { ROLE_MESSAGE } from "@app/messages";
import type { TUserCreateInput } from "@app/schemas";
import { expect, type Page, test } from "@playwright/test";
import { PERMISSION_KEY, PERMISSION_LABEL } from "../support/access.ts";
import { confirmAction } from "../support/confirm.ts";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { signIn } from "../support/sign-in.ts";
import { signOut } from "../support/sign-out.ts";
import { createUser } from "../support/users.ts";

const READER_ROLE = {
	key: "e2e-role-reader",
	label: "E2E Role Reader",
};

const READER: TUserCreateInput = {
	name: "E2E Role Reader",
	email: "e2e-role-reader@test.app",
	password: "readPassword123",
	role: READER_ROLE.key,
};

test.describe.configure({ mode: "serial" });

test.describe("a role that may only read roles", () => {
	let page: Page;

	test.beforeAll(async ({ browser }): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.admin);
		await page.goto(webPathOf("/roles/create"));
		await page.getByLabel("Label", { exact: true }).fill(READER_ROLE.label);
		await page
			.getByRole("checkbox", {
				name: PERMISSION_LABEL[PERMISSION_KEY.ROLE_READ],
			})
			.check();
		await page
			.getByRole("button", { name: ROLE_MESSAGE.CREATE_ACTION })
			.click();
		await confirmAction(page);
		await expect(page).toHaveURL(/\/roles$/);
		await createUser(page, READER, READER_ROLE.label);
		await signOut(page);
		await signIn(page, { email: READER.email, password: READER.password });
	});

	test.afterAll(async (): Promise<void> => {
		await page.close();
	});

	test("sees a role's detail page with no way to save it", async (): Promise<void> => {
		await page.goto(webPathOf(`/roles/${READER_ROLE.key}`));

		await expect(
			page.getByRole("heading", { name: READER_ROLE.label }),
		).toBeVisible();
		await expect(
			page.getByRole("checkbox", {
				name: PERMISSION_LABEL[PERMISSION_KEY.ROLE_READ],
			}),
		).toBeChecked();
		await expect(
			page.getByRole("button", { name: ROLE_MESSAGE.SAVE_CHANGES }),
		).toHaveCount(0);
	});
});
