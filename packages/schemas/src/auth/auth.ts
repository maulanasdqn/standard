import { z } from "zod";
import { permissionSchema } from "../permission/permission.ts";

export const sessionUserSchema = z.object({
	id: z.uuid(),
	email: z.email(),
	name: z.string(),
	role: z.string().min(1),
});
export type TSessionUser = z.infer<typeof sessionUserSchema>;

export const meSchema = z.object({
	user: sessionUserSchema,
	permissions: z.array(permissionSchema).readonly(),
});
export type TMe = z.infer<typeof meSchema>;

export const passwordChangeInputSchema = z.object({
	currentPassword: z.string().min(1, "Enter your current password."),
	newPassword: z
		.string()
		.min(8, "Use at least 8 characters.")
		.max(128, "Use at most 128 characters."),
});
export type TPasswordChangeInput = z.infer<typeof passwordChangeInputSchema>;

export const loginInputSchema = z.object({
	email: z.email("Enter a valid email address."),
	password: z.string().min(1, "Enter your password."),
});
export type TLoginInput = z.infer<typeof loginInputSchema>;
