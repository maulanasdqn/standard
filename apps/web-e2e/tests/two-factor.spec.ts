import { AUTH_MESSAGE } from "@app/messages";
import { expect, type Page, test } from "@playwright/test";
import { mailLinkWait } from "../support/mailpit.ts";
import { totpCode } from "../support/totp.ts";

const PASSWORD = "Strong1pass";
const VERIFY_LINK = /https?:\/\/\S+verify-email\S+/;

const typeInto = async (
	page: Page,
	label: string,
	value: string,
): Promise<void> => {
	await page.getByLabel(label, { exact: true }).pressSequentially(value);
};

const signInWithPassword = async (page: Page, email: string): Promise<void> => {
	await page.goto("/login");
	await typeInto(page, AUTH_MESSAGE.FIELD_EMAIL, email);
	await typeInto(page, AUTH_MESSAGE.FIELD_PASSWORD, PASSWORD);
	await page.getByRole("button", { name: AUTH_MESSAGE.LOGIN_ACTION }).click();
};

test("a user turns on two-factor and then signs in with a code", async ({
	page,
}): Promise<void> => {
	const email = `web-2fa-${crypto.randomUUID().slice(0, 8)}@test.app`;
	await page.goto("/register");
	await typeInto(page, AUTH_MESSAGE.FIELD_NAME, "Two Factor");
	await typeInto(page, AUTH_MESSAGE.FIELD_EMAIL, email);
	await typeInto(page, AUTH_MESSAGE.FIELD_PASSWORD, PASSWORD);
	await typeInto(page, AUTH_MESSAGE.FIELD_PASSWORD_CONFIRM, PASSWORD);
	await page
		.getByRole("button", { name: AUTH_MESSAGE.REGISTER_ACTION })
		.click();
	await expect(
		page.getByRole("heading", { name: AUTH_MESSAGE.CHECK_EMAIL_TITLE }),
	).toBeVisible();
	await page.goto(await mailLinkWait(email, VERIFY_LINK));
	await page.getByRole("link", { name: AUTH_MESSAGE.CONTINUE }).click();
	await expect(page).toHaveURL(/\/dashboard/);

	await page.goto("/account");
	await page
		.getByRole("button", { name: AUTH_MESSAGE.TWO_FACTOR_TURN_ON })
		.click();
	await page
		.getByLabel(AUTH_MESSAGE.TWO_FACTOR_PASSWORD_PROMPT)
		.pressSequentially(PASSWORD);
	await page
		.getByRole("button", { name: AUTH_MESSAGE.TWO_FACTOR_CONTINUE })
		.click();
	const secret =
		(await page.locator("code").first().textContent())?.trim() ?? "";
	await page
		.getByLabel(AUTH_MESSAGE.FIELD_TWO_FACTOR_CODE)
		.fill(totpCode(secret));
	await page
		.getByRole("button", { name: AUTH_MESSAGE.TWO_FACTOR_VERIFY_AND_ENABLE })
		.click();
	await expect(
		page.getByText(AUTH_MESSAGE.TWO_FACTOR_BACKUP_TITLE),
	).toBeVisible();
	await page
		.getByRole("button", { name: AUTH_MESSAGE.TWO_FACTOR_DONE })
		.click();

	await page.context().clearCookies();
	await signInWithPassword(page, email);
	await expect(page).toHaveURL(/\/two-factor/);
	await page
		.getByLabel(AUTH_MESSAGE.FIELD_TWO_FACTOR_CODE)
		.fill(totpCode(secret));
	await page
		.getByRole("button", { name: AUTH_MESSAGE.TWO_FACTOR_VERIFY })
		.click();
	await expect(page).toHaveURL(/\/dashboard/);
});
