import { test } from "@playwright/test";
import { SEED_CREDENTIALS } from "../../support/credentials.ts";
import { expectNavVisible, NAV_LABEL } from "../../support/nav.ts";
import { signIn } from "../../support/sign-in.ts";

test("shows Notes in the sidebar of a role that reads notes", async ({
	page,
}): Promise<void> => {
	await signIn(page, SEED_CREDENTIALS.viewer);

	await expectNavVisible(page, [NAV_LABEL.NOTES]);
});
