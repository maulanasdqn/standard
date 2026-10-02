import { ERROR_MESSAGE, TABLE_MESSAGE } from "@app/messages";
import { ACTIVITY_ACTION } from "@app/activity";
import { ACTIVITY_ACTION_LABEL } from "@app/messages";
import type { TUserCreateInput } from "@app/schemas";
import { expect, type Page, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../support/credentials.ts";
import { expectNavHidden, NAV_LABEL } from "../support/nav.ts";
import { signIn } from "../support/sign-in.ts";
import { signOut } from "../support/sign-out.ts";
import { selectOption } from "../support/select.ts";
import { ROLE_KEY, ROLE_LABEL } from "../support/access.ts";
import { createUser } from "../support/users.ts";

const AUDITED_USER: TUserCreateInput = {
	name: "E2E Audited",
	email: "e2e-audited@test.app",
	password: "Audited-password-123",
	role: ROLE_KEY.VIEWER,
};

test.describe.configure({ mode: "serial" });

test.describe("activity log", () => {
	let page: Page;

	test.beforeAll(async ({ browser }): Promise<void> => {
		page = await browser.newPage();
		await signIn(page, SEED_CREDENTIALS.admin);
	});

	test.afterAll(async (): Promise<void> => {
		await page.close();
	});

	test("records a user creation attributed to the admin", async (): Promise<void> => {
		await createUser(page, AUDITED_USER, ROLE_LABEL[ROLE_KEY.VIEWER]);

		await page.goto("/activity");
		await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();

		await page.getByRole("button", { name: TABLE_MESSAGE.FILTERS }).click();
		await selectOption(
			page,
			page.getByLabel("Action", { exact: true }),
			ACTIVITY_ACTION_LABEL[ACTIVITY_ACTION.USER_CREATE],
		);
		await page
			.getByRole("button", { name: TABLE_MESSAGE.FILTER_APPLY })
			.click();
		await expect(page).toHaveURL(/action=user\.create/);

		const entry = page
			.getByRole("row")
			.filter({ hasText: SEED_CREDENTIALS.admin.email })
			.filter({ hasText: ACTIVITY_ACTION_LABEL[ACTIVITY_ACTION.USER_CREATE] })
			.first();
		await expect(entry).toBeVisible();
	});

	test("is hidden from a viewer", async (): Promise<void> => {
		await signOut(page);
		await signIn(page, SEED_CREDENTIALS.viewer);

		await expectNavHidden(page, [NAV_LABEL.ACTIVITY]);

		await page.goto("/activity");
		await expect(
			page.getByRole("heading", { name: ERROR_MESSAGE.FORBIDDEN_TITLE }),
		).toBeVisible();
		await expect(page).toHaveURL(/\/activity/);
	});
});
