import { z } from "zod";

export const ACCOUNT_TAB = {
	PROFILE: "profile",
	SECURITY: "security",
	SESSIONS: "sessions",
} as const;

export type TAccountTab = (typeof ACCOUNT_TAB)[keyof typeof ACCOUNT_TAB];

export const ACCOUNT_TAB_INDICATOR_ID = "account-tab-indicator";

export const accountSearchSchema = z.object({
	tab: z
		.enum([ACCOUNT_TAB.PROFILE, ACCOUNT_TAB.SECURITY, ACCOUNT_TAB.SESSIONS])
		.optional(),
});
