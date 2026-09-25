import { NOTE_MESSAGE, ROLE_MESSAGE, USER_MESSAGE } from "@app/messages";
import type { TRoleCreateInput, TUserCreateInput } from "@app/schemas";
import { expect, type Page, test } from "@playwright/test";
import {
	PERMISSION_KEY,
	PERMISSION_LABEL,
	ROLE_KEY,
	ROLE_LABEL,
} from "../support/access.ts";
import { confirmAction } from "../support/confirm.ts";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { deleteButtonOf, deleteFromRow } from "../support/delete.ts";
import { createNote } from "../support/notes.ts";
import { signIn } from "../support/sign-in.ts";
import { rowWithCell } from "../support/table.ts";
import { createUser } from "../support/users.ts";

const DOOMED_NOTE = "Doomed note";

const DOOMED_USER: TUserCreateInput = {
	name: "E2E Doomed",
	email: "e2e-doomed@test.app",
	password: "doomed-password-123",
	role: ROLE_KEY.VIEWER,
};

const DOOMED_ROLE: TRoleCreateInput = {
	key: "e2e-doomed",
	label: "Doomed",
	description: "About to go.",
	permissions: [PERMISSION_KEY.NOTE_READ],
};

test.describe.configure({ mode: "serial" });

test.describe("deleting from the lists", () => {
	let page: Page;

	test.beforeAll(async ({ browser }): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.admin);
	});

	test.afterAll(async (): Promise<void> => {
		await page.close();
	});

	test("deletes a note after the confirmation", async (): Promise<void> => {
		await createNote(page, DOOMED_NOTE);

		await deleteFromRow(page, page.getByRole("row", { name: DOOMED_NOTE }));

		await expect(page.getByText(NOTE_MESSAGE.DELETED)).toBeVisible();
		await expect(page.getByText(DOOMED_NOTE, { exact: true })).toHaveCount(0);
	});

	test("deletes another user but never offers to delete the signed-in one", async (): Promise<void> => {
		await createUser(page, DOOMED_USER, ROLE_LABEL[ROLE_KEY.VIEWER]);

		await expect(
			deleteButtonOf(rowWithCell(page, SEED_CREDENTIALS.admin.email)),
		).toBeDisabled();

		await deleteFromRow(page, rowWithCell(page, DOOMED_USER.email));

		await expect(page.getByText(USER_MESSAGE.DELETED)).toBeVisible();
		await expect(rowWithCell(page, DOOMED_USER.email)).toHaveCount(0);
	});

	test("deletes an unused custom role and offers no delete on a fixed one", async (): Promise<void> => {
		await page.goto("/roles");
		await page.getByLabel("Key", { exact: true }).fill(DOOMED_ROLE.key);
		await page.getByLabel("Label", { exact: true }).fill(DOOMED_ROLE.label);
		await page
			.getByLabel("Description", { exact: true })
			.fill(DOOMED_ROLE.description ?? "");
		await page
			.getByRole("checkbox", {
				name: PERMISSION_LABEL[PERMISSION_KEY.NOTE_READ],
			})
			.check();
		await page
			.getByRole("button", { name: ROLE_MESSAGE.CREATE_ACTION })
			.click();
		await confirmAction(page);
		await expect(rowWithCell(page, DOOMED_ROLE.key)).toBeVisible();

		await expect(deleteButtonOf(rowWithCell(page, ROLE_KEY.ADMIN))).toHaveCount(
			0,
		);

		await deleteFromRow(page, rowWithCell(page, DOOMED_ROLE.key));

		await expect(page.getByText(ROLE_MESSAGE.DELETED)).toBeVisible();
		await expect(rowWithCell(page, DOOMED_ROLE.key)).toHaveCount(0);
	});
});
