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

export const loginInputSchema = z.object({
	email: z.email("Enter a valid email address."),
	password: z.string().min(1, "Enter your password."),
});
export type TLoginInput = z.infer<typeof loginInputSchema>;
