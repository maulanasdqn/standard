import { z } from "zod";
import { userIdSchema } from "../auth/auth.ts";

const NAME_MAX = 100;
const dateTimeSchema = z.iso.datetime();

export const userInviteInputSchema = z.object({
	name: z.string().trim().min(1).max(NAME_MAX),
	email: z.email(),
	role: z.string().min(1),
});
export type TUserInviteInput = z.infer<typeof userInviteInputSchema>;

export const userSessionSchema = z.object({
	id: z.string(),
	ipAddress: z.string().nullable(),
	userAgent: z.string().nullable(),
	createdAt: dateTimeSchema,
	updatedAt: dateTimeSchema,
	expiresAt: dateTimeSchema,
});
export type TUserSession = z.infer<typeof userSessionSchema>;

export const userSessionListSchema = z.array(userSessionSchema).readonly();
export type TUserSessionList = z.infer<typeof userSessionListSchema>;

export const userSessionRevokeInputSchema = z.object({
	id: userIdSchema,
	sessionId: z.string().min(1),
});
export type TUserSessionRevokeInput = z.infer<
	typeof userSessionRevokeInputSchema
>;

export const USER_STATUS = {
	ACTIVE: "active",
	PENDING: "pending",
	DEACTIVATED: "deactivated",
} as const;

export type TUserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const USER_TWO_FACTOR_FILTER = {
	ON: "on",
	OFF: "off",
} as const;

export type TUserTwoFactorFilter =
	(typeof USER_TWO_FACTOR_FILTER)[keyof typeof USER_TWO_FACTOR_FILTER];
