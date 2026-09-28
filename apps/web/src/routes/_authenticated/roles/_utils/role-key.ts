import { kebabCase, kebabCaseDraft } from "@app/format";

const ROLE_KEY_MAX_LENGTH = 50;
const LEADING_NON_LETTERS = /^[^a-z]+/;
const NOTHING = "";

const roleKeyDraft = (value: string): string =>
	kebabCaseDraft(value)
		.replace(LEADING_NON_LETTERS, NOTHING)
		.slice(0, ROLE_KEY_MAX_LENGTH);

export const roleKeyOf = (value: string): string =>
	kebabCase(roleKeyDraft(value));
