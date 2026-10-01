import { z } from "zod";

export const ROLE_TYPE_FILTER = {
	FIXED: "fixed",
	CUSTOM: "custom",
} as const;

export type TRoleTypeFilter =
	(typeof ROLE_TYPE_FILTER)[keyof typeof ROLE_TYPE_FILTER];

export const ROLE_MEMBERS_FILTER = {
	WITH: "with",
	WITHOUT: "without",
} as const;

export type TRoleMembersFilter =
	(typeof ROLE_MEMBERS_FILTER)[keyof typeof ROLE_MEMBERS_FILTER];

export const roleListSearchSchema = z.object({
	type: z.enum([ROLE_TYPE_FILTER.FIXED, ROLE_TYPE_FILTER.CUSTOM]).optional(),
	members: z
		.enum([ROLE_MEMBERS_FILTER.WITH, ROLE_MEMBERS_FILTER.WITHOUT])
		.optional(),
});

export type TRoleListSearch = z.infer<typeof roleListSearchSchema>;
