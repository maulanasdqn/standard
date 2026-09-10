import type { TLoginInput } from "@app/schemas";
import { expect, type Page } from "@playwright/test";

const submitLogin = async (
	page: Page,
	{ email, password }: TLoginInput,
): Promise<void> => {
	await page.goto("/login");
	await page.getByLabel("Email").fill(email);
	await page.getByLabel("Password").fill(password);
	await page.getByRole("button", { name: "Sign in" }).click();
};

export const signIn = async (
	page: Page,
	credentials: TLoginInput,
): Promise<void> => {
	await submitLogin(page, credentials);
	await expect(page).toHaveURL(/\/notes/);
};

export const signInExpectingRejection = async (
	page: Page,
	credentials: TLoginInput,
): Promise<void> => {
	await submitLogin(page, credentials);
	await expect(page.getByText(/invalid|incorrect/i)).toBeVisible();
	await expect(page).toHaveURL(/\/login/);
};
