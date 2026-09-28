import { describe, expect, it } from "vitest";
import { roleKeyOf } from "#/routes/_authenticated/roles/_utils/role-key.ts";

const LONG_WORD = "a";
const ROLE_KEY_MAX_LENGTH = 50;

describe("roleKeyOf", () => {
	it("turns a label into a lowercase kebab key", (): void => {
		expect(roleKeyOf("Content Reviewer")).toBe("content-reviewer");
	});

	it("starts the key with a letter", (): void => {
		expect(roleKeyOf("2nd Line Support")).toBe("nd-line-support");
	});

	it("caps the key at the length the schema allows", (): void => {
		expect(roleKeyOf(LONG_WORD.repeat(80))).toHaveLength(ROLE_KEY_MAX_LENGTH);
	});

	it("never ends on a hyphen after the cap", (): void => {
		const label = `${LONG_WORD.repeat(ROLE_KEY_MAX_LENGTH - 1)} b`;
		expect(roleKeyOf(label).endsWith("-")).toBe(false);
	});
});
