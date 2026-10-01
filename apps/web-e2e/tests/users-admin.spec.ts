import { AUTH_MESSAGE, USER_MESSAGE } from "@app/messages";
import { expect, type Page, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { mailLinkWait } from "../support/mailpit.ts";
import { chooseRowAction } from "../support/row-menu.ts";
import { signIn } from "../support/sign-in.ts";
import { rowWithCell } from "../support/table.ts";

const PASSWORD = "Invited1pass";
const INVITE_LINK = /https?:\/\/\S+reset-password\/\S+/;

const typeInto = async (
	page: Page,
	label: string,
	value: string,
): Promise<void> => {
	await page.getByLabel(label, { exact: true }).pressSequentially(value);
};

const signInAs = async (page: Page, email: string): Promise<void> => {
	await page.goto("/login");
	await typeInto(page, AUTH_MESSAGE.FIELD_EMAIL, email);
	await typeInto(page, AUTH_MESSAGE.FIELD_PASSWORD, PASSWORD);
	await page.getByRole("button", { name: AUTH_MESSAGE.LOGIN_ACTION }).click();
};

test("an admin invites a user, who joins, and then deactivates them", async ({
	browser,
}): Promise<void> => {
	const email = `web-invite-${crypto.randomUUID().slice(0, 8)}@test.app`;
	const admin = await browser.newPage();
	await signIn(admin, SEED_CREDENTIALS.admin);

	await admin.goto("/users");
	await admin.getByRole("link", { name: USER_MESSAGE.INVITE_USER }).click();
	await expect(
		admin.getByRole("heading", { name: USER_MESSAGE.INVITE_TITLE }),
	).toBeVisible();
	await typeInto(admin, USER_MESSAGE.COLUMN_NAME, "Web Invitee");
	await typeInto(admin, USER_MESSAGE.COLUMN_EMAIL, email);
	await admin.getByRole("button", { name: USER_MESSAGE.INVITE_ACTION }).click();
	await expect(rowWithCell(admin, email)).toContainText(
		USER_MESSAGE.STATUS_PENDING,
	);

	const invitee = await browser.newPage();
	await invitee.goto(await mailLinkWait(email, INVITE_LINK));
	await expect(
		invitee.getByRole("heading", { name: AUTH_MESSAGE.INVITE_SET_TITLE }),
	).toBeVisible();
	await typeInto(invitee, AUTH_MESSAGE.FIELD_NEW_PASSWORD, PASSWORD);
	await typeInto(invitee, AUTH_MESSAGE.FIELD_CONFIRM_PASSWORD, PASSWORD);
	await invitee
		.getByRole("button", { name: AUTH_MESSAGE.INVITE_SET_ACTION })
		.click();
	await expect(invitee).toHaveURL(/\/login/);
	await signInAs(invitee, email);
	await expect(invitee).toHaveURL(/\/dashboard/);

	await admin.reload();
	await expect(rowWithCell(admin, email)).toContainText(
		USER_MESSAGE.STATUS_ACTIVE,
	);
	await chooseRowAction(
		admin,
		rowWithCell(admin, email),
		USER_MESSAGE.ACTION_DEACTIVATE,
	);
	await admin
		.getByRole("alertdialog")
		.getByRole("button", { name: USER_MESSAGE.ACTION_DEACTIVATE })
		.click();
	await expect(rowWithCell(admin, email)).toContainText(
		USER_MESSAGE.STATUS_DEACTIVATED,
	);

	await invitee.reload();
	await expect(invitee).toHaveURL(/\/login/);
	await signInAs(invitee, email);
	await expect(
		invitee.getByText(AUTH_MESSAGE.ACCOUNT_DEACTIVATED),
	).toBeVisible();
});
