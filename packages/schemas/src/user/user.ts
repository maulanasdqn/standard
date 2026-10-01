import { z } from "zod";
import { userIdSchema } from "../auth/auth.ts";
import { passwordSchema } from "../auth/password.ts";
import { dayRangeShape, instantRangeShape } from "../shared/date-range.ts";
import { USER_STATUS, USER_TWO_FACTOR_FILTER } from "./user-admin.ts";
import { baseSchema, type TEntityOf } from "../shared/base-schema.ts";
import { paginated, paginationSchema } from "../shared/pagination.ts";
import { searchQuerySchema } from "../shared/search.ts";
import { SORT_DIRECTION, sortDirectionSchema } from "../shared/sort.ts";

export const userSchema = baseSchema(userIdSchema).extend({
	name: z.string(),
	email: z.email(),
	emailVerified: z.boolean(),
	image: z.string().nullable(),
	role: z.string().min(1),
	deactivatedAt: z.iso.datetime().nullable(),
	twoFactorEnabled: z.boolean(),
});
export type TUser = TEntityOf<z.infer<typeof userSchema>>;

export const userCreateInputSchema = z.object({
	name: z.string().min(1).max(100),
	email: z.email(),
	password: passwordSchema,
	role: z.string().min(1),
});
export type TUserCreateInput = z.infer<typeof userCreateInputSchema>;

export const userUpdateInputSchema = z.object({
	id: userIdSchema,
	name: z.string().min(1).max(100).optional(),
	email: z.email().optional(),
	role: z.string().min(1).optional(),
});
export type TUserUpdateInput = z.infer<typeof userUpdateInputSchema>;

export const userIdInputSchema = z.object({ id: userIdSchema });
export type TUserIdInput = z.infer<typeof userIdInputSchema>;

export const userPasswordResetInputSchema = z.object({
	id: userIdSchema,
	password: passwordSchema,
});
export type TUserPasswordResetInput = z.infer<
	typeof userPasswordResetInputSchema
>;

export const USER_SORT = {
	NAME: "name",
	EMAIL: "email",
	ROLE: "role",
	CREATED_AT: "createdAt",
} as const;

export type TUserSort = (typeof USER_SORT)[keyof typeof USER_SORT];

const userListBaseSchema = paginationSchema.extend({
	search: searchQuerySchema.optional(),
	role: z.string().optional(),
	status: z
		.enum([USER_STATUS.ACTIVE, USER_STATUS.PENDING, USER_STATUS.DEACTIVATED])
		.optional(),
	twoFactor: z
		.enum([USER_TWO_FACTOR_FILTER.ON, USER_TWO_FACTOR_FILTER.OFF])
		.optional(),
	sortBy: z
		.enum([
			USER_SORT.NAME,
			USER_SORT.EMAIL,
			USER_SORT.ROLE,
			USER_SORT.CREATED_AT,
		])
		.default(USER_SORT.CREATED_AT),
	sortDir: sortDirectionSchema.default(SORT_DIRECTION.ASC),
});

export const userListInputSchema = userListBaseSchema.extend(instantRangeShape);
export type TUserListInput = z.infer<typeof userListInputSchema>;

export const userListSearchSchema = userListBaseSchema.extend(dayRangeShape);
export type TUserListSearch = z.infer<typeof userListSearchSchema>;

export const userListSchema = paginated(userSchema);
export type TUserList = z.infer<typeof userListSchema>;
