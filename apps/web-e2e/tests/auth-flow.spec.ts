import { AUTH_MESSAGE } from "@app/messages";
import { expect, type Page, test } from "@playwright/test";
import { mailCount, mailLinkWait } from "../support/mailpit.ts";

const STRONG_PASSWORD = "Strong1pass";
const NEWER_PASSWORD = "Newer2pass";
const VERIFY_LINK = /https?:\/\/\S+verify-email\S+/;
const RESET_LINK = /https?:\/\/\S+reset-password\/\S+/;

const uniqueEmail = (): string =>
	`web-flow-${crypto.randomUUID().slice(0, 8)}@test.app`;

const typeInto = async (
	page: Page,
	label: string,
	value: string,
): Promise<void> => {
	await page.getByLabel(label, { exact: true }).pressSequentially(value);
};

const register = async (page: Page, email: string): Promise<void> => {
	await page.goto("/login");
	await page.getByRole("link", { name: AUTH_MESSAGE.SIGN_UP_LINK }).click();
	await expect(
		page.getByRole("heading", { name: AUTH_MESSAGE.REGISTER_TITLE }),
	).toBeVisible();
	await typeInto(page, AUTH_MESSAGE.FIELD_NAME, "Web Flow");
	await typeInto(page, AUTH_MESSAGE.FIELD_EMAIL, email);
	await typeInto(page, AUTH_MESSAGE.FIELD_PASSWORD, STRONG_PASSWORD);
	await typeInto(page, AUTH_MESSAGE.FIELD_PASSWORD_CONFIRM, STRONG_PASSWORD);
	await page
		.getByRole("button", { name: AUTH_MESSAGE.REGISTER_ACTION })
		.click();
	await expect(
		page.getByRole("heading", { name: AUTH_MESSAGE.CHECK_EMAIL_TITLE }),
	).toBeVisible();
};

test("a new account confirms its email and lands on the dashboard", async ({
	page,
}): Promise<void> => {
	const email = uniqueEmail();
	await register(page, email);

	await page.goto(await mailLinkWait(email, VERIFY_LINK));
	await expect(
		page.getByRole("heading", { name: AUTH_MESSAGE.VERIFY_SUCCESS_TITLE }),
	).toBeVisible();
	await page.getByRole("link", { name: AUTH_MESSAGE.CONTINUE }).click();
	await expect(page).toHaveURL(/\/dashboard/);
});

test("an unconfirmed account is told to confirm its email first", async ({
	page,
}): Promise<void> => {
	const email = uniqueEmail();
	await register(page, email);

	await page.goto("/login");
	await typeInto(page, AUTH_MESSAGE.FIELD_EMAIL, email);
	await typeInto(page, AUTH_MESSAGE.FIELD_PASSWORD, STRONG_PASSWORD);
	await page.getByRole("button", { name: AUTH_MESSAGE.LOGIN_ACTION }).click();

	await expect(page.getByText(AUTH_MESSAGE.EMAIL_NOT_VERIFIED)).toBeVisible();
});

test("a forgotten password is reset through the emailed link", async ({
	page,
}): Promise<void> => {
	const email = uniqueEmail();
	await register(page, email);
	await page.goto(await mailLinkWait(email, VERIFY_LINK));
	await page.context().clearCookies();
	const before = await mailCount(email);

	await page.goto("/login");
	await page
		.getByRole("link", { name: AUTH_MESSAGE.FORGOT_PASSWORD_LINK })
		.click();
	await expect(
		page.getByRole("heading", { name: AUTH_MESSAGE.FORGOT_TITLE }),
	).toBeVisible();
	await typeInto(page, AUTH_MESSAGE.FIELD_EMAIL, email);
	await page.getByRole("button", { name: AUTH_MESSAGE.FORGOT_ACTION }).click();
	await expect(page.getByText(AUTH_MESSAGE.FORGOT_SENT)).toBeVisible();

	await page.goto(await mailLinkWait(email, RESET_LINK, before));
	await expect(
		page.getByRole("heading", { name: AUTH_MESSAGE.RESET_TITLE }),
	).toBeVisible();
	await typeInto(page, AUTH_MESSAGE.FIELD_NEW_PASSWORD, NEWER_PASSWORD);
	await typeInto(page, AUTH_MESSAGE.FIELD_CONFIRM_PASSWORD, NEWER_PASSWORD);
	await page
		.getByRole("button", { name: AUTH_MESSAGE.PASSWORD_UPDATE })
		.click();
	await expect(page).toHaveURL(/\/login/);

	await typeInto(page, AUTH_MESSAGE.FIELD_EMAIL, email);
	await typeInto(page, AUTH_MESSAGE.FIELD_PASSWORD, NEWER_PASSWORD);
	await page.getByRole("button", { name: AUTH_MESSAGE.LOGIN_ACTION }).click();
	await expect(page).toHaveURL(/\/dashboard/);
});
