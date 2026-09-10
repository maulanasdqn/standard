import { z } from "zod";
import { paginated, paginationSchema } from "../shared/pagination.ts";

export const userSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	email: z.email(),
	emailVerified: z.boolean(),
	image: z.string().nullable(),
	role: z.string().min(1),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
});
export type TUser = z.infer<typeof userSchema>;

export const userCreateInputSchema = z.object({
	name: z.string().min(1).max(100),
	email: z.email(),
	password: z.string().min(8).max(128),
	role: z.string().min(1),
});
export type TUserCreateInput = z.infer<typeof userCreateInputSchema>;

export const userUpdateInputSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1).max(100).optional(),
	role: z.string().min(1).optional(),
});
export type TUserUpdateInput = z.infer<typeof userUpdateInputSchema>;

export const userIdInputSchema = z.object({ id: z.uuid() });
export type TUserIdInput = z.infer<typeof userIdInputSchema>;

export const userPasswordResetInputSchema = z.object({
	id: z.uuid(),
	password: z.string().min(8).max(128),
});
export type TUserPasswordResetInput = z.infer<
	typeof userPasswordResetInputSchema
>;

export const userListInputSchema = paginationSchema.extend({
	search: z.string().optional(),
	role: z.string().optional(),
});
export type TUserListInput = z.infer<typeof userListInputSchema>;

export const userListSchema = paginated(userSchema);
export type TUserList = z.infer<typeof userListSchema>;
