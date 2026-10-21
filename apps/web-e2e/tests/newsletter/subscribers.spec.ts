import { apiPathOf, ROUTE_PATH, webPathOf } from "@app/contract";
import { ERROR_MESSAGE, NEWSLETTER_MESSAGE } from "@app/messages";
import {
	NEWSLETTER_SOURCE,
	type TNewsletterSubscribeInput,
} from "@app/schemas";
import { expect, type Page, test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../../support/credentials.ts";
import { deleteFromRow } from "../../support/delete.ts";
import {
	expectNavHidden,
	expectNavVisible,
	NAV_LABEL,
} from "../../support/nav.ts";
import { signIn } from "../../support/sign-in.ts";
import { signOut } from "../../support/sign-out.ts";
import { rowWithCell } from "../../support/table.ts";

const SIGN_UP: TNewsletterSubscribeInput = {
	email: "e2e-reader@test.app",
	source: NEWSLETTER_SOURCE.BLOG,
};

test.describe.configure({ mode: "serial" });

test.describe("newsletter subscribers", () => {
	let page: Page;

	test.beforeAll(async ({ browser }): Promise<void> => {
		page = await browser.newPage();
		const response = await page.request.post(
			apiPathOf(ROUTE_PATH.NEWSLETTER_SUBSCRIPTIONS),
			{ data: SIGN_UP },
		);
		expect(response.ok()).toBe(true);
		await signIn(page, SEED_CREDENTIALS.admin);
	});

	test.afterAll(async (): Promise<void> => {
		await page.close();
	});

	test("an admin finds a sign-up with its status and source", async (): Promise<void> => {
		await expectNavVisible(page, [NAV_LABEL.SUBSCRIBERS]);
		await page.goto(webPathOf("/subscribers"));
		await expect(
			page.getByRole("heading", { name: NEWSLETTER_MESSAGE.TITLE }),
		).toBeVisible();

		const row = rowWithCell(page, SIGN_UP.email);
		await expect(row).toContainText(NEWSLETTER_MESSAGE.STATUS_PENDING);
		await expect(row).toContainText(NEWSLETTER_MESSAGE.SOURCE_BLOG);
	});

	test("an admin removes a subscriber", async (): Promise<void> => {
		await deleteFromRow(page, rowWithCell(page, SIGN_UP.email));

		await expect(page.getByText(NEWSLETTER_MESSAGE.DELETED)).toBeVisible();
		await expect(rowWithCell(page, SIGN_UP.email)).toHaveCount(0);
	});

	test("is hidden from a viewer", async (): Promise<void> => {
		await signOut(page);
		await signIn(page, SEED_CREDENTIALS.viewer);

		await expectNavHidden(page, [NAV_LABEL.SUBSCRIBERS]);

		await page.goto(webPathOf("/subscribers"));
		await expect(
			page.getByRole("heading", { name: ERROR_MESSAGE.FORBIDDEN_TITLE }),
		).toBeVisible();
	});
});
